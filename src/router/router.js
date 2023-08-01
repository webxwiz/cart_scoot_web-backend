import { Router } from "express";

import { multerConfig, resizeOneImage } from '../utils/_index.js';

import uploadService from "../service/uploadService.js";
import awsS3Service from "../service/awsS3Service.js";

import authMiddleware from "../middlewares/authMiddleware.js";

const router = new Router();

router.post('/avatar',
    authMiddleware,
    multerConfig.single('avatar'),
    async function (req, res, next) {
        try {
            const fileName = `avatars/${req.userId}-avatar.webp`
            const image = await resizeOneImage(req.file.buffer, 100);
            const avatarURL = await awsS3Service.uploadImageToS3(image, fileName);
            const user = await uploadService.uploadAvatarUrl(req.userId, avatarURL);

            res.json({
                user,
                message: "Avatar successfully uploaded.",
            });
        } catch (error) {
            next(error)
        }
    },
);

router.delete('/avatar',
    authMiddleware,
    async function (req, res, next) {
        try {
            const fileName = `avatars/${req.userId}-avatar.webp`;
            await awsS3Service.deleteImageFromS3(fileName);
            const user = await uploadService.deleteAvatarUrl(req.userId);

            res.json({
                user,
                message: "Avatar successfully deleted.",
            });
        } catch (error) {
            next(error)
        }
    },
);

router.post('/license',
    authMiddleware,
    multerConfig.single('license'),
    async function (req, res, next) {
        try {
            const fileName = `licenses/${req.userId}-license.webp`
            const image = await resizeOneImage(req.file.buffer, 600);
            const licenseURL = await awsS3Service.uploadImageToS3(image, fileName);
            const user = await uploadService.uploadLicenseUrl(req.userId, licenseURL);

            res.json({
                user,
                message: "License successfully uploaded.",
            });
        } catch (error) {
            next(error)
        }
    },
);

router.delete('/license',
    authMiddleware,
    async function (req, res, next) {
        try {
            const fileName = `licenses/${req.userId}-license.webp`;
            await awsS3Service.deleteImageFromS3(fileName);
            const user = await uploadService.deleteLicenseUrl(req.userId);

            res.json({
                user,
                message: "License successfully deleted.",
            });
        } catch (error) {
            next(error)
        }
    },
);


export default router;