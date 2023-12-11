import sharp from "sharp";

export const resizeOneImage = async (buffer, size) => {

    return await sharp(buffer)
        .resize(size, size)
        .rotate()
        .webp()
        .toBuffer()
}

export const oneImageToWebp = async (buffer) => {

    return await sharp(buffer)
        .rotate()
        .webp()
        .toBuffer()
}

