import { supportedMimes } from "../config/filetype.js";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import { log } from "console";


export const imageValidator = (size, mime) => {
    // image size not more 2mb
    if (bytesToMb(size) > 2) {
        return "Image size must be less than 2 MB.";
    }
    else if (!supportedMimes.includes(mime)) {
        return "Image must be type of png,jpg,jpeg,svg,webp,gif.";
    }

    // if no error then return null
    return null;
}

// convert bytes to mb
export const bytesToMb = (bytes) => {
    return bytes / (1024 * 1024);
}

// generate random id
export const generateRandomNum = () => {
    return uuidv4();
}

// get image url

export const getImageUrl = (imageName) => {
    return `${process.env.APP_URL}/images/${imageName}`;
}

// remove image
export const removeImage = (imageName) => {

    const path = process.cwd() + "/public/images/" + imageName;
    if(fs.existsSync(path)){
        // delete the image if exists
        fs.unlinkSync(path);
        log("deleted successfully")
    }
}

// upload image
export const uploadImage = (image) => {
    console.log("image uploaded");
    const imgExt = image?.name.split(".");
    const imageName = generateRandomNum() + "." + imgExt[1];
    const uploadPath = process.cwd() + "/public/images/" + imageName;

    image?.mv(uploadPath, (err) => {
        if (err) throw err;
    });

    return imageName;
}