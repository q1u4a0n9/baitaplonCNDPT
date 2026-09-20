const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    websiteName: String,
    phone: String,
    email: String,
    address: String,
    logo: String,
    favicon: String,
    youtubeVideo: String,
    sakuraEffect: {
      type: Boolean,
      default: false
    },
  }
);

const SettingWebsiteInfo = mongoose.model('SettingWebsiteInfo', schema, "setting-website-info");

module.exports = SettingWebsiteInfo;