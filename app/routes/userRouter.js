const express = require("express");
const dayjs = require('dayjs');
const bcrypt = require("bcryptjs");
const router = express.Router();
const hashPassword = require('../utils/common');
const dotenv = require("dotenv");
const knexConfig = require('../db/knexfile');
const HttpException = require('../utils/HttpException');
dotenv.config();
//initialize knex
const knex = require('knex')(knexConfig[process.env.NODE_ENV]);
//allowed user middleware
const isAllowedUser = require('../middleware/authUser');



/************* routers ************/

//test router
router.get("/test", isAllowedUser(), (req, res) => res.json({ msg: "Users works!!" }));

//set cookie using name and password
router.post('/auth/login', isAllowedUser(), async (req, res) => {
    const name = req.body.name ? req.body.name : '';
    const password = req.body.password ? req.body.password : '';
    
    if (!req.body.name) {
        return res.json({success: false, message: 'Name is required'});
    }

    if (!req.body.password) {
       return res.json({success: false, message: 'Password is required'});
    }    
    knex('users')
    .select()
    .where({name})
    .then( async (user) => {
        if(user.length !== 0)  {
            console.log(user[0].password)

            const isMatch = await bcrypt.compare(password, user[0].password);
            if (!isMatch) {
                throw new HttpException(401, "Incorrect account or password");
            }
            console.log(user)
            res.cookie("secureCookie", JSON.stringify(process.env.WATCHTOWER_SECRET + user[0].name), {
                secure: process.env.NODE_ENV !== "development",
                httpOnly: true,
                expires: dayjs().add(30, "days").toDate(),
            });
        }
        return res.send(user);
    })
    .catch((err) => {
        console.error(err);
        return res.json({success: false, message: 'An error occurred, please try again later.'});
    });
});
  
// get users have the permission allowed_users
router.get('/users', isAllowedUser(), (req, res) => {
    knex('users')
    .select('name', 'allow_users', 'allow_graphql', 'allow_metadata', 'allow_migrations')
    .then((user) => {
        return res.send(user);
    })
    .catch((err) => {
        console.error(err);
        return res.json({success: false, message: 'An error occurred, please try again later.'});
    });
});

// create new user
router.post('/user/create', isAllowedUser(), async (req, res) => {

    if (!req.body.name) {
        return res.json({success: false, message: 'Name is required'});
    }

    if (!req.body.password) {
        return res.json({success: false, message: 'Password is required'});
    }

    await hashPassword(req);

    const name = req.body.name ? req.body.name : '';
    const password = req.body.password ? req.body.password : '';
    const allow_users = req.body.allow_users ? req.body.allow_users : false;
    const allow_graphql = req.body.allow_graphql ? req.body.allow_graphql : false;
    const allow_metadata = req.body.allow_metadata ? req.body.allow_metadata : false;
    const allow_migrations = req.body.allow_migrations ? req.body.allow_migrations : false;

    knex('users')
      .insert({name, password, allow_users, allow_graphql, allow_metadata, allow_migrations})
      .then((id) => {
        //get user by id
        knex('users')
          .select({
            id: 'id',
            name: 'name'
          })
          .where({id})
          .then((user) => {
                console.log(user)
                return res.json({'200' : 'User Created'});
          })
      })
      .catch((err) => {
        console.error(err);
        return res.json({success: false, message: 'An error occurred, please try again later.'});
      });
  
})

// Get user By Id
router.get('/user/:id', isAllowedUser(), (req, res) => {
    knex('users')
    .select('name', 'allow_users', 'allow_graphql', 'allow_metadata', 'allow_migrations')
    .where({'id': req.params.id})
    .then((user) => {
        return res.send(user);
    })
    .catch((err) => {
        console.error(err);
        return res.json({success: false, message: 'An error occurred, please try again later.'});
    });
});

// Put user by Id
router.put('/user/:id', isAllowedUser(), async (req, res) => {

    if (!req.body.name) {
        return res.json({success: false, message: 'Name is required'});
    }

    if (req.body.password) {
        await hashPassword(req);
    }

    const name = req.body.name ? req.body.name : '';
    const password = req.body.password ? req.body.password : '';
    const allow_users = req.body.allow_users ? req.body.allow_users : false;
    const allow_graphql = req.body.allow_graphql ? req.body.allow_graphql : false;
    const allow_metadata = req.body.allow_metadata ? req.body.allow_metadata : false;
    const allow_migrations = req.body.allow_migrations ? req.body.allow_migrations : false;

    if(password) {
        knex('users')
        .where({'id': req.params.id})
        .update({'name': name, 'password': password, 'allow_users': allow_users, 'allow_graphql': allow_graphql, 'allow_metadata': allow_metadata, 'allow_migrations': allow_migrations})
        .then((user) => {
            console.log(user);
            return res.json({success: true, message: '200: User Updated'});
        })
        .catch((err) => {
            console.error(err);
            return res.json({success: false, message: 'An error occurred, please try again later.'});
        });
    } else {
        knex('users')
        .where({'id': req.params.id})
        .update({'name': name, 'allow_users': allow_users, 'allow_graphql': allow_graphql, 'allow_metadata': allow_metadata, 'allow_migrations': allow_migrations})
        .then((user) => {
            console.log(user);
            return res.json({success: true, message: '200: User Updated'});
        })
        .catch((err) => {
            console.error(err);
            return res.json({success: false, message: 'An error occurred, please try again later.'});
        });
    }
});


// Delete user by Id
router.delete('/user/:id', isAllowedUser(), async (req, res) => {
    knex('users')
    .where({'id': req.params.id})
    .del()
    .then((user) => {
        console.log(user);
        return res.json({success: true, message: '200: User deleted'});
    })
    .catch((err) => {
        console.error(err);
        return res.json({success: false, message: 'An error occurred, please try again later.'});
    });
});

module.exports = router;