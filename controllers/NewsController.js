import vine, { errors } from "@vinejs/vine";
import { newsSchema } from "../validations/newsValidation.js";
import { generateRandomNum, imageValidator, removeImage, uploadImage } from "../utils/helper.js";
import prisma from "../DB/db.config.js";
import NewsApiTransform from "../transform/newsApiTransform.js";
import redisCache from "../DB/redis.config.js";
import { logger } from "../config/logger.js";



class NewsController {
    static async index(req, res) {

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 1;


        if (page <= 0) {
            page = 1;
        }

        if (limit <= 0 || limit > 100) {
            limit = 10;
        }

        const skip = (page - 1) * limit;

        const news = await prisma.news.findMany({
            take: limit,
            skip: skip,
            include: {
                user: {
                    select: {
                        // id:true,
                        name: true,
                        profile: true,
                    }
                }
            }
        });

        const totalNews = await prisma.news.count();
        const totalPages = Math.ceil(totalNews / limit);


        const newsTransform = news?.map((item) => NewsApiTransform.transform(item));
        return res.json({
            status: 200, news: newsTransform, metaData: {
                totalPages,
                currentPage: page,
                currentLimit: limit,
            }
        })
    }
    // route not added
    static async nonPaginated(req, res) {
        const news = await prisma.news.findMany({
            include: {
                user: {
                    select: {
                        // id:true,
                        name: true,
                        profile: true,
                    }
                }
            }
        });
        const newsTransform = news?.map((item) => NewsApiTransform.transform(item));
        return res.json({ status: 200, news: newsTransform })
    }

    static async store(req, res) {
        try {
            const user = req.user;
            const body = req.body;

            // validate 
            const validator = vine.compile(newsSchema);
            const payload = await validator.validate(body);

            // if no images is selected
            if (!req.files || Object.keys(req.files).length === 0) {
                return res.status(400).json({ errors: { image: "Image field is required." } });
            }

            const image = req.files?.image;
            // image custome validator
            const message = imageValidator(image?.size, image?.mimetype);

            if (message !== null) {
                return res.status(400).json({
                    errors: {
                        image: message,
                    }
                })
            }

            // file upload
            const imgExt = image?.name.split(".");
            const imageName = generateRandomNum() + "." + imgExt[1];
            const uploadPath = process.cwd() + "/public/images/" + imageName;

            image?.mv(uploadPath, (err) => {
                if (err) throw err;
            });

            // add image abd userid in payload
            payload.image = imageName;
            payload.user_id = user.id;

            // remove cache
            redisCache.del("/api/news", (err) => {
                if(err) throw err;
            });

            const news = await prisma.news.create({
                data: payload
            })
            return res.json({ status: 200, message: "Image uploaded successfully", payload, });
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
    static async update(req, res) {
        try {
            const { id } = req.params;
            const user = req.user;
            const body = req.body;
            const news = await prisma.news.findUnique({
                where: {
                    id: Number(id),
                },
            });

            // private route
            if (user.id !== news.user_id) {
                return res.status(400).json({ message: "Unauthorized" });
            }

            // validating body
            const validator = vine.compile(newsSchema);
            const payload = await validator.validate(body);

            // if there is image
            const image = req?.files?.image;
            if (image) {
                // make image validation
                const message = imageValidator(image?.size, image?.mimetype);
                if (message !== null) {
                    return res.status(400).json({
                        errors: {
                            image: message,
                        }
                    });
                }

                // upload image
                const imageName = uploadImage(image);
                payload.image = imageName;

                // delete the old image
                removeImage(news.image);
            }

            const updatedNews = await prisma.news.update({
                data: payload,
                where: {
                    id: Number(id),
                }
            });

            return res.json({
                status: 200,
                message: "News Updated successfully!",
                news: updatedNews,
            });

        } catch (error) {
            console.log("error is", error);
            if (error instanceof errors.E_VALIDATION_ERROR) {
                return res.status(400).json({ errors: error.messages });
            } else {
                return res.status(500).json({
                    status: 500,
                    message: "Something went wrong. Please try again."
                });
            }
        }
    }


    static async show(req, res) {

        try {
            const { id } = req.params;
            const news = await prisma.news.findUnique({
                where: {
                    id: Number(id),
                },
                include: {
                    user: {
                        select: {
                            // id:true,
                            name: true,
                            profile: true,
                        }
                    }
                }
            });

            // if the id not exist
            const transformNew = news ? NewsApiTransform.transform(news) : news;

            return res.json({ stayus: 200, news: transformNew })
        } catch (error) {
            console.log("error is", error);
            logger.error(error);
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
    static async destroy(req, res) {
        try {
            const { id } = req.params;
            const user = req.user;
            const news = await prisma.news.findUnique({
                where: {
                    id: Number(id),
                }
            });

            if (news === null) {
                return res.status(400).json({ message: `News Post id: ${id} invalid` })
            }
            if (user.id !== news?.user_id) {
                return res.status(401).json({ message: "Unauthorized" })
            }

            // delete image 
            removeImage(news?.image);

            // then delete news
            await prisma.news.delete({
                where: {
                    id: Number(id),
                }
            })

            return res.json({message: "News Post deleted successfully"});
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
}

export default NewsController;