// All supplied images keep their original pixels and aspect ratios.
// Add the real QR image here when supplied; null deliberately renders a placeholder.
const picture = (name) => `${import.meta.env.BASE_URL}pictures/${name}`
export const assets = {
  leftBrand: picture('生产试井分析技术标志.png'),
  rightBrand: picture('petroscopy.png'),
  production: picture('data1.png'),
  theory: picture('data2.png'),
  wechatQr: null,
}

export const externalLinks = {
  doi: 'https://doi.org/10.19657/j.geoscience.1000-8527.202511060144',
  article: 'https://mp.weixin.qq.com/s/WEFVgOopnVauMKddUwQv8g',
}
