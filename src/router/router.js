import crypto from 'crypto';

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
    multerConfig.fields([
        { name: 'license', maxCount: 10 },
    ]),
    async function (req, res, next) {
        try {
            const licenseURL = [];
            for (const image of req.files.license) {
                const fileName = (`licenses/${req.userId}-${crypto.randomBytes(4).toString('hex')}.webp`);
                const resizedImage = await resizeOneImage(image.buffer, 800);
                const singleLicenseURL = await awsS3Service.uploadImageToS3(resizedImage, fileName);
                licenseURL.push(singleLicenseURL);
            }

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
        const deleteMarker = [];
        try {
            const { imageKeyList, updatedUser } = await uploadService.deleteLicenseUrl(req.userId);
            for (const key of imageKeyList) {
                const result = await awsS3Service.deleteImageFromS3(`licenses/${key}`);
                deleteMarker.push(result.DeleteMarker);
            }

            res.json({
                deleteMarker,
                user: updatedUser,
                message: `${deleteMarker.length} images successfully deleted.`,
            });
        } catch (error) {
            next(error)
        }
    },
);


export default router;