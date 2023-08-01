import sharp from "sharp";

export const resizeOneImage = async (buffer, size) => {

    return await sharp(buffer)
        .resize(size)
        .webp()
        .toBuffer()
}