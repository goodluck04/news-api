import {Router} from "express";
import AuthController from "../controllers/authController.js";
import authMiddleware from "../middleware/Authenticate.js";
import ProfileController from "../controllers/ProfileController.js";
import NewsController from "../controllers/NewsController.js";
import redisCache from "../DB/redis.config.js";


const router = Router();

router.post("/auth/register", AuthController.register);
router.post("/auth/login", AuthController.login);


// profile routes // private
router.get("/profile", authMiddleware, ProfileController.index);
// update image
router.put("/profile/:id", authMiddleware, ProfileController.update);
router.get("/send-email", AuthController.sendTestEmail);

// news routes
router.post("/news", authMiddleware,NewsController.store);
router.get("/news/:id", NewsController.show);
router.get("/news", redisCache.route({expire: 60 * 60}),NewsController.index);
router.put("/news/:id", authMiddleware,NewsController.update);
router.delete("/news/:id",authMiddleware, NewsController.destroy);


// send email

export default router;