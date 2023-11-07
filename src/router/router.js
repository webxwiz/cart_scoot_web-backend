import crypto from 'crypto';
import { basename } from 'path';

import { Router } from "express";

import { multerConfig, resizeOneImage, oneImageToWebp } from '../utils/_index.js';

import uploadService from "../service/uploadService.js";
import awsS3Service from "../service/awsS3Service.js";

import authMiddleware from "../middlewares/authMiddleware.js";

const router = new Router();

router.post('/avatar',
    authMiddleware,
    multerConfig.single('avatar'),
    async function (req, res, next) {
        try {
            const partName = crypto.randomBytes(1).toString('hex');
            const fileName = `avatars/${req.userId}-${partName}-avatar.webp`;
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
            const user = await uploadService.deleteAvatarUrl(req.userId);
            const fileName = basename(user.avatarURL);
            await awsS3Service.deleteImageFromS3(fileName);

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
            const { imageKeyList } = await uploadService.deleteLicenseUrl(req.userId);
            for (const key of imageKeyList) {
                await awsS3Service.deleteImageFromS3(`licenses/${key}`);
            }

            const licenseURL = [];
            for (const image of req.files.license) {
                const fileName = (`licenses/${req.userId}-${crypto.randomBytes(4).toString('hex')}.webp`);
                const resizedImage = await resizeOneImage(image.buffer, 1200);
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

router.post('/banner',
    authMiddleware,
    multerConfig.single('banner'),
    async function (req, res, next) {
        try {
            const partName = crypto.randomBytes(6).toString('hex');
            const fileName = `banners/${partName}-banner.webp`;
            const image = await oneImageToWebp(req.file.buffer)
            const imageURL = await awsS3Service.uploadImageToS3(image, fileName);

            res.json({
                imageURL,
                message: "Banner successfully uploaded.",
            });
        } catch (error) {
            next(error)
        }
    },
);


export default router;