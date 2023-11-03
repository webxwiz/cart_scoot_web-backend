import sharp from "sharp";

export const resizeOneImage = async (buffer, size) => {

    return await sharp(buffer)
        .resize(size, size)
        .webp()
        .toBuffer()
}

export const oneImageToWebp = async (buffer) => {

    return await sharp(buffer)
        .webp()
        .toBuffer()
}

