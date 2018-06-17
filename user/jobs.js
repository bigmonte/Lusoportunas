const express = require("express");
const ObjectID = require("mongodb").ObjectId;
const router = express.Router();
const lusDB = require("../backend/data/lusDB");
module.exports = router;


/* Trabalhos 2 */
router.get('/meustrabalhos', async function (req, res) {
    let uname = req.user.username;
    let query = {"ruser.username": uname};

    lusDB.Job.find(query).exec()
        .then(function (jobs) {
            res.render("c/user-jobs-active", {
                title: "Lusoportunas - Ofertas de emprego publicadas",
                ruser: req.user,
                jobs: jobs
            });
        })
        .catch(next);
});

/* Trabalhos 2 END */

/* Trabalhos 2 */
router.get('/candidaturas', async function (req, res) {
    let uname = req.user.username;
    let query = {"ruser.username": uname};

    lusDB.Job.find(query).exec()
        .then(function (jobs) {
            res.render("c/user-recruit-applications", {
                title: "Lusoportunas - Ofertas de emprego publicadas",
                ruser: req.user,
                jobs: jobs
            });
        })
        .catch(next);
});

/* Trabalhos 2 END */

/* Trabalhos 3 */
router.get('/trabalhosExpirados', async function (req, res) {
    let uname = req.user.username;
    let query = {"ruser.username": uname};

    lusDB.Job.find(query).exec()
        .then(function (jobs) {
            res.render("c/user-jobs-expired", {
                title: "Lusoportunas - Ofertas de emprego publicadas",
                ruser: req.user,
                jobs: jobs
            });
        })
        .catch(next);
});

/* Trabalhos 3 END */


router.get('/meusTrabalhos', async function (req, res) {
    let uname = req.user.username;
    console.log(req.user.username);
    let query = {"ruser.username": uname};

    lusDB.Job.find(query).exec()
        .then(function (jobs) {
            res.render("user/trabalhos/meusTrabalhos", {
                title: "Bem-vindos ao Lusoportunas",
                ruser: req.user,
                jobs: jobs
            });
        })
        .catch(next);
});

router.get('/trabalhos', async function (req, res) {
    let name = req.query.name;
    let query = {};
    if (name) {
        query.name = {$regex: name};
    }

    lusDB.Job.find(query).exec()
        .then(function (jobs) {
            res.render("user/trabalhos/lista", {
                title: "Bem-vindos ao Lusoportunas",
                ruser: req.user,
                jobs: jobs
            });
        })
        .catch(next);

});

router.route('/trabalho/adicionar')
    .get(function (req, res) {
        let name = req.query.name;
        let query = {};
        if (name) {
            query.name = {$regex: name};
        }

        lusDB.User.find(query).exec()
            .then(function (users) {
                res.render("user/trabalhos/adicionar", {
                    title: "Lusoportunas - Adicionar Trabalho",
                    ruser: req.user,
                    users: users
                });
            })
    })
    .post(function (req, res, next) {
        lusDB.User.find({"company.name": "kaka"}, {"company.$": 1, "name": "kaka"}).exec()
            .then(function (user) {
                let getNow = new Date();
                let expDate = new Date(req.body.expirationDate);
                let job = {
                    date: getNow,
                    ruser: req.user,
                    body: {
                        "cargo": req.body.cargo,
                        "requisitos": req.body.requisitos,
                        "beneficios": req.body.beneficios,
                        "responsabilidades": req.body.responsabilidades,
                        "vagas": req.body.vagas,
                        "oferta": req.body.oferta
                    },
                    location: req.body.location,
                    company: req.body.companyName,
                    jobType: req.body.jobType,
                    jobSector: req.body.jobSector,
                    jobFunction: req.body.jobFunction,
                    expirationDate: expDate,
                    gender: req.body.gender

                };

                lusDB.connect
                    .then(db => db.collection("jobs").insertOne(job))
                    .then(result => res.redirect(req.baseUrl + "/trabalhos"));
            });
    });


router.route('/trabalho/editar/:id')
    .all(function (req, res, next) {
        let jobId = req.params.id;
        let filter = {_id: new ObjectID(jobId)};

        lusDB.connect
            .then(db => db.collection("jobs").find(filter).next())
            .then(job => {

                if (!job) {
                    res.sendStatus(404);
                    return;
                }
                res.locals.job = job;
                next();
            })
            .catch(next);
    })
    .get(function (req, res) {
        res.render("user/trabalhos/editar",
            {
                ruser: req.user
            });
    })
    .post(function (req, res, next) {

        let jobId = req.params.id;
        let filter = {_id: new ObjectID(jobId)};
        let update = {
            $set: {
                name: req.body.name,
                body: req.body.body,
                company: req.body.company,
                industry: req.body.industry,
                jobFunction: req.body.jobFunction,
                address: req.body.address,
                date: req.body.date
            }
        };
        lusDB.connect
            .then(db => db.collection("jobs").updateOne(filter, update))
            .then(result => res.redirect(req.baseUrl + "/trabalhos"))
            .catch(next);
    });

router.get('/trabalho/eliminar/:id', function (req, res, next) {
    let jobId = new ObjectID(req.params.id);
    let filter = {_id: jobId};

    lusDB.connect
        .then(db => db.collection("jobs").deleteOne(filter))
        .then(result => res.redirect(req.baseUrl + "/trabalhos"))
        .catch(next);

});


router.route('/trabalho/:id')
    .all(function (req, res, next) {
        let jobId = req.params.id;
        let filter = {_id: new ObjectID(jobId)};

        lusDB.connect
            .then(db => db.collection("jobs").find(filter).next())
            .then(job => {

                if (!job) {
                    res.sendStatus(404);
                    return;
                }
                res.locals.job = job;
                next();
            })
            .catch(next);
    })
    .get(function (req, res) {
        res.render("user/trabalhos/trabalho",
            {
                ruser: req.user
            }
        );
    });

/* CONCORRER 2 */

router.route('/trabalho/concorrer/:id')
    .all(function (req, res, next) {
        const jobId = req.params.id;
        lusDB.Job.findById(jobId).exec()   //find a doccument by Id
            .then(job => {
                if (!job) {
                    res.sendStatus(404);
                    return;
                }
                res.locals.job = job;
                next();

            }).catch(next);

    })
    .get(function (req, res) {
        res.render("c/user-application-compose",
            {
                ruser: req.user
            }
        );
    })
    .post(function (req, res, next) {

        let space = res.locals.job.application.length;
        let setDate= new Date();
        function applicationFromRequestBody(job, request) {

            job.application[space] = {
                ruser: req.user,
                body: {
                    bdate: setDate,
                    application: request.body["message"],

                },
            };
        }

        applicationFromRequestBody(res.locals.job, req);

        res.locals.job.save()
            .then(() => res.redirect(req.baseUrl + "/meusTrabalhos"))
            .catch(error => {
                if (error.name === "Validation Error") {
                    res.locals.error = error;
                    res.render("user/perfil/atributos/education/adicionarEducacao");
                    return;
                }
                next(error);
            });

    });


/*CONCORRer 2 */
//
// router.route('/trabalho/concorrer/:id')
//     .all(function (req, res, next) {
//         const jobId = req.params.id;
//         lusDB.Job.findById(jobId).exec()   //find a doccument by Id
//             .then(job => {
//                 if (!job) {
//                     res.sendStatus(404);
//                     return;
//                 }
//                 res.locals.job = job;
//                 next();
//
//             }).catch(next);
//
//     })
//     .get(function (req, res) {
//         res.render("user/trabalhos/applications/aplicar",
//             {
//                 ruser: req.user
//             }
//         );
//     })
//     .post(function (req, res, next) {
//
//         let space = res.locals.job.application.length;
//         let setDate= new Date();
//         function applicationFromRequestBody(job, request) {
//             job.application[space] = {
//                 message: request.body["message"],
//                 date: setDate,
//                 ruser: req.user
//             };
//         }
//
//         applicationFromRequestBody(res.locals.job, req);
//
//         res.locals.job.save()
//             .then(() => res.redirect(req.baseUrl + "/meusTrabalhos"))
//             .catch(error => {
//                 if (error.name === "Validation Error") {
//                     res.locals.error = error;
//                     res.render("user/perfil/atributos/education/adicionarEducacao");
//                     return;
//                 }
//                 next(error);
//             });
//
//     });

router.route('/applications/:id')
    .all(function (req, res, next) {
        const jobId = req.params.id;

        lusDB.Job.findById(jobId).exec()   //find a doccument by Id
            .then(job => {
                if (!job) {
                    res.sendStatus(404);
                    return;
                }
                res.locals.job = job;
                next();

            }).catch(next);

    })
    .get(function (req, res) {
        res.render("user/trabalhos/applications/applications",
            {
                ruser: req.user
            }
        );
    });

// router.route('/application/:id')
//     .all(function (req, res, next) {
//         let applicationId = req.params.id;
//
//         lusDB.connect
//             .then(db => db.collection("jobs").find({"application._id": new ObjectID(applicationId)}, {
//                 "application.$": 1,
//                 "_id": new ObjectID(applicationId)
//             }).next())
//             .then(job => {
//
//                 if (!job) {
//                     res.sendStatus(404);
//                     return;
//                 }
//                 res.locals.job = job;
//                 next();
//             })
//             .catch(next);
//     })
//     .get(function (req, res) {
//         res.render("user/trabalhos/applications/application",
//             {
//                 ruser: req.user
//             }
//         );
//     });

/* APPLICATION 2 */
router.route('/application/:id')
    .all(function (req, res, next) {
        let applicationId = req.params.id;

        lusDB.connect
            .then(db => db.collection("jobs").find({"application._id": new ObjectID(applicationId)}, {
                "jobFunction":1,
                "application.$": 1,
                "_id": new ObjectID(applicationId)
            }).next())
            .then(job => {

                if (!job) {
                    res.sendStatus(404);
                    return;
                }
                res.locals.job = job;
                next();
            })
            .catch(next);
    })
    .get(function (req, res) {
        res.render("c/user-application",
            {
                ruser: req.user
            }
        );
    });
/* APPLICATION 2 */

