const express = require("express");
const ObjectID = require("mongodb").ObjectId;
const router = express.Router();
const lusDB = require("../backend/data/lusDB");
const uuid = require("uuid");
const fs = require("fs");
module.exports = router;

router.use(function (req, res, next) {
    if (req.isAuthenticated()) {
        res.locals.user = req.user;
        next();
        return;
    }
    res.redirect("/entrar");
});

router.route('/empresa/editar/:id')
    .all(function (req, res, next) {
        let companieId = req.params.id;

        lusDB.connect
            .then(db => db.collection("users").find({"company._id": new ObjectID(companieId)}, {
                "company.$": 1,
                "_id": new ObjectID(companieId)
            }).next())
            .then(user => {

                if (!user) {
                    res.sendStatus(404);
                    return;
                }
                res.locals.user = user;
                next();
            })
            .catch(next);
    })
    .get(function (req, res) {
        res.render("c/user-recruit-company-edit",
            {
                title: "Lusoportunas - Editar Empresa",
                ruser: req.user
            }
        );
    })
    .post(function (req, res, next) {

        let profilePicture = req.files.profilePicture;

        if (profilePicture) {

            let fileType = "";
            if (profilePicture.mimetype === "image/jpeg") {
                fileType = ".jpg";

            }
            if (profilePicture.mimetype === "image/png") {
                fileType = ".png";
            }


            var profilePath = './user/uploads/' + req.user._id + '' + '/companies';

            if (!fs.existsSync(profilePath)) {
                fs.mkdirSync(profilePath);
            }

            else {
                let thisDir = __dirname;
                let thisNewDir = thisDir.replace('/user', '');
                let newfileName = uuid.v4() + fileType;
                let cutPath = profilePath.replace('.', '');
                var finalPath = cutPath + '/' + newfileName;

                profilePicture.mv(thisNewDir + finalPath, function (err) {
                    if (err) {
                        return res.status(500).send(err);
                    }
                })
            }
        }

        let space = res.locals.user.company.length;

        function companyFromRequestBody(user, request, profilepic) {
            user.company[space] = {
                if (profilePath) {
                    logo : profilepic.replace('/user/uploads', '');
                },
                location: request.body.location,
                name: request.body.name,
                description: request.body.description,
                mission: request.body.mission,
                objectives: request.body.objectives,

            };
        }

        companyFromRequestBody(res.locals.user, req, finalPath);

        res.locals.user.save()
            .then(() => res.redirect(req.baseUrl + "/minhasEmpresas"))
            .catch(error => {
                if (error.name === "Validation Error") {
                    res.locals.error = error;
                    res.render("user/empresas/adicionar", {
                        ruser: req.user,
                        title: "Lusoportunas - Adicionar Empresa"
                    });
                    return;
                }
                next(error);
            });

    });


router.route('/empresa/:id')
    .all(function (req, res, next) {
        let companieId = req.params.id;

        lusDB.connect
            .then(db => db.collection("users").find({"company._id": new ObjectID(companieId)}, {
                "company.$": 1,
                "_id": new ObjectID(companieId)
            }).next())
            .then(user => {

                if (!user) {
                    res.sendStatus(404);
                    return;
                }
                res.locals.user = user;
                next();
            })
            .catch(next);
    })
    .get(function (req, res) {
        res.render("user/empresas/empresa",
            {
                ruser: req.user,
                title: "Lusoportunas"+" - "+res.locals.user.company[0].name
            }
        );
    });

router.get('/empresas', async function (req, res) {
    let name = req.query.name; //filter alias , SEARCH
    let query = {};
    if (name) {
        query.name = {$regex: name};
    }

    lusDB.User.find(query).exec()
        .then(function (users) {
            res.render("user/empresas/todasEmpresas", {
                title: "Lusoportunas - Empresas",
                ruser: req.user,
                users: users
            });
        })
        .catch(next);

});

router.get('/minhasEmpresas', async function (req, res) {
    let uname = req.user.username;
    let query = {"ruser.username": uname};

    lusDB.User.find(query).exec()
        .then(function (company) {
            res.render("user/empresas/minhasEmpresas", {
                title: "Lusoportunas - Minhas Empresas",
                ruser: req.user,
                company: company
            });
        })
        .catch(next);
});

router.get('/cminhasempresas', async function (req, res) {
    let uname = req.user.username;
    let query = {"ruser.username": uname};

    lusDB.User.find(query).exec()
        .then(function (company) {
            res.render("c/user-recruit-companies", {
                title: "Lusoportunas - Minhas Empresas",
                ruser: req.user,
                company: company
            });
        })
        .catch(next);
});


router.route('/perfil/:id/adicionarEmpresa')
    .all(function (req, res, next) {
        const userId = req.params.id;

        lusDB.User.findById(userId).exec()   //find a doccument by Id
            .then(user => {
                if (!user) {
                    res.sendStatus(404);
                    return;
                }
                res.locals.user = user;
                res.locals.userHasRole = function (role) { //check roles
                    return (user.roles || []).indexOf(role) > -1
                };
                next();

            }).catch(next);

    })
    .get(function (req, res) {
        res.render("user/empresas/adicionar",
            {
                title: "Lusoportunas - Adicionar Empresa",
                ruser: req.user
            }
        );
    })
    .post(function (req, res, next) {

        let profilePicture = req.files.profilePicture;

        if (profilePicture) {

            let fileType = "";
            if (profilePicture.mimetype === "image/jpeg") {
                fileType = ".jpg";

            }
            if (profilePicture.mimetype === "image/png") {
                fileType = ".png";
            }


            var profilePath = './user/uploads/' + req.user._id + '' + '/companies';

            if (!fs.existsSync(profilePath)) {
                fs.mkdirSync(profilePath);
            }

            else {
                let thisDir = __dirname;
                let thisNewDir = thisDir.replace('/user', '');
                let newfileName = uuid.v4() + fileType;
                let cutPath = profilePath.replace('.', '');
                var finalPath = cutPath + '/' + newfileName;

                profilePicture.mv(thisNewDir + finalPath, function (err) {
                    if (err) {
                        return res.status(500).send(err);
                    }
                })
            }
        }

        let space = res.locals.user.company.length;

        function companyFromRequestBody(user, request, profilepic) {
            user.company[space] = {
                if (profilePath) {
                    logo : profilepic.replace('/user/uploads', '');
                },
                location: request.body.location,
                name: request.body.name,
                description: request.body.description,
                mission: request.body.mission,
                objectives: request.body.objectives,

            };
        }

        companyFromRequestBody(res.locals.user, req, finalPath);

        res.locals.user.save()
            .then(() => res.redirect(req.baseUrl + "/minhasEmpresas"))
            .catch(error => {
                if (error.name === "Validation Error") {
                    res.locals.error = error;
                    res.render("user/empresas/adicionar",{
                        title: "Lusoportunas - Adicionar Empresa (erro)"
                    });
                    return;
                }
                next(error);
            });

    });