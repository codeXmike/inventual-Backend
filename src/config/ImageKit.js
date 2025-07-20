import ImageKit from "imagekit";

const connectImageKit = async () => {
  const imagekit = await new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
  });
  return imagekit;
};

export default connectImageKit;