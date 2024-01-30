import vine, { errors } from "@vinejs/vine";
import prisma from "../DB/db.config.js";
import { loginSchema, registerSchema } from "../validations/authValidation.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail } from "../config/mailer.js";
import { logger } from "../config/logger.js";
import { emailQueue, emailQueueName } from "../jobs/SendEmailJob.js";





class AuthController {
    // using static bcoz dont want to create instance but want direct access
    static async register(req, res,) {
        try {

            const body = req.body;

            // validating request body
            const validator = vine.compile(registerSchema)

            const payload = await validator.validate(body);

            // check if user already exist
            const findUser = await prisma.users.findUnique({
                where: {
                    email: payload.email,
                }
            })

            // if exist then return
            if (findUser) {
                return res.status(400).json({
                    errors: {
                        email: "email already taken.please use another one."
                    }
                })
            }


            // encrypt the password
            const salt = bcrypt.genSaltSync(10);
            payload.password = bcrypt.hashSync(payload.password, salt);

            const user = await prisma.users.create({
                data: payload
            });

            return res.json({ status: 200, message: "User created successfully", user, });
        } catch (error) {
            console.log("error is", error);
            if (error instanceof errors.E_VALIDATION_ERROR) {
                // console.log(error.message);
                return res.status(400).json({ errors: error.messages })
            } else {
                return res.status(500).json({
                    status: 500,
                    message: "Something went wrong .Please try again."
                })
            }

        }

    }

    // 
    static async login(req, res) {
        try {
            const body = req.body;
            const validator = vine.compile(loginSchema);
            const payload = await validator.validate(body);

            // find user
            const findUser = await prisma.users.findUnique({
                where: {
                    email: payload.email,
                }
            });

            if (findUser) {
                // if user found
                if (!bcrypt.compareSync(payload.password, findUser.password)) {
                    return res.status(400).json({
                        errors: {
                            email: "Invalid Credentials",
                        },
                    })
                }

                // generate tokens
                const payloadData = {
                    id: findUser.id,
                    name: findUser.name,
                    email: findUser.email,
                    profile: findUser.profile,
                }

                const token = jwt.sign(payloadData, process.env.JWT_SECRET, {
                    expiresIn: "365d",
                });

                // else return token
                return res.json({ message: "Logged in", access_token: `Bearer ${token}` });
            }

            // if user not found (!findUser)
            return res.status(400).json({
                errors: {
                    email: "No user found with this email."
                }
            })



            return res.json({ payload });
        } catch (error) {
            console.log("error is", error);
            if (error instanceof errors.E_VALIDATION_ERROR) {
                // console.log(error.message);
                return res.status(400).json({ errors: error.messages })
            } else {
                return res.status(500).json({
                    status: 500,
                    message: "Something went wrong .Please try again."
                })
            }
        }
    }

    // test  send email
    static async sendTestEmail(req, res) {
        try {
            const { email } = req.query;
            // const payload = {
            //     toEmail: email,
            //     subject: "Hey I am just testing",
            //     body: "<h1>Hello World ! I am the best </h1>"
            // }

            // sending multiple email at time
            const payload = [
                {
                    toEmail: email,
                    subject: "Hey I am just testing",
                    body: "<h1>Hello World ! I am the best </h1>"
                },
                {
                    toEmail: email,
                    subject: "Hey I am just testing",
                    body: "<h1>Hello World ! I am the best </h1>"
                },
                {
                    toEmail: email,
                    subject: "Hey I am just testing",
                    body: "<h1>Hello World ! I am the best </h1>"
                },
                {
                    toEmail: email,
                    subject: "Hey I am just testing",
                    body: "<h1>Hello World ! I am the best </h1>"
                },
                {
                    toEmail: email,
                    subject: "Hey I am just testing",
                    body: "<h1>Hello World ! I am the best </h1>"
                },
                {
                    toEmail: email,
                    subject: "Hey I am just testing",
                    body: "<h1>Hello World ! I am the best </h1>"
                },
                {
                    toEmail: email,
                    subject: "Hey I am just testing",
                    body: "<h1>Hello World ! I am the best </h1>"
                },
                {
                    toEmail: email,
                    subject: "Hey I am just testing",
                    body: "<h1>Hello World ! I am the best </h1>"
                },
                {
                    toEmail: email,
                    subject: "Hey I am just testing",
                    body: "<h1>Hello World ! I am the best </h1>"
                },
            ]

            await emailQueue.add(emailQueueName, payload)

            // send using queue
            // await sendEmail(payload.toEmail, payload.subject, payload.body);
            // await sendEmail(payload.toEmail, "Second-Mail", payload.body);
            return res.json({ status: 200, message: "Job added successfully" });
        } catch (error) {
            logger.error(error);
            return res.status(500).json({ message: "Something went wrong.Please try again" });
        }
    }
}

export default AuthController;

