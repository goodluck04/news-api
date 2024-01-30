import prisma from "../DB/db.config.js";
import { generateRandomNum, imageValidator } from "../utils/helper.js";

class ProfileController {
    // get user profile
    static async index(req, res) {
        try {
            const user = req.user;
            return res.json({ status: 200, user });
        } catch (error) {
            return res.status(500).json({ message: "Something went wrong." })
        }
    }

    static async update(req, res) {

        try {
            const { id } = req.params;
            const authUser = req.user;
            // there should be file
            if (!req.files || Object.keys(req.files).length === 0) {
                return res.status(400).json({ status: 400, message: "Profile image is required." });
            }

            const profile = req.files.profile;
            const message = imageValidator(profile?.size, profile.mimetype);

            // if the image is not valid means that there is error message
            if (message !== null) {
                return res.status(400).json({
                    errors: {
                        profile: message,
                    },
                });
            }

            // adding unique id for every images upload
            const imgExt = profile?.name.split(".");
            const imageName = generateRandomNum() + "." + imgExt[1];
            const uploadPath = process.cwd() + "/public/images/" + imageName;

            // upload image
            profile.mv(uploadPath, (err) => {
                // if then throw upload the image
                if (err) throw err;
            });

            await prisma.users.update({
                data: {
                    profile: imageName
                },
                where: {
                    id: Number(id)
                }
            })



            return res.json({
                status: 200,
                message: "Profile update successfully!",
            });
        } catch (error) {
            console.log("The error is ", error);
            return res.status(500).json({ message: "Something went wrong!" });
        }
    }

    static async show() { }

    static async store() { }

    static async destroy() { }
}

export default ProfileController;
