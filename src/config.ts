import type { Site, SocialObjects } from "./types";

export const SITE: Site = {
  website: "https://k1r.in", // replace this with your deployed domain
  author: "KrDw",
  desc: "Noting is to reinforce the future.",
  title: "KrDw Publish",
  ogImage: "og.png",
  lightAndDarkMode: true,
  postPerPage: 10,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
};

export const LOCALE = {
  lang: "zh", // html lang code. Set this empty and default will be "en"
  langTag: ["zh-CN"], // BCP 47 Language Tags. Set this empty [] to use the environment default
} as const;

export const LOGO_IMAGE = {
  enable: false,
  svg: true,
  width: 216,
  height: 46,
};

export const FRIENDS1 = [
  {
    name: "fuuzen",
    avatar: "https://fuuzen.github.io/assets/friends/fuuzen.jpg",
    url: "https://taf.fyi",
    description: "个人分享主页",
  },
];

export const FRIENDS2 = [
  {
    name: "面条实验室",
    url: "https://chi.miantiao.me",
    description: "很多有意思的自部署项目，在用他的短链接项目 Sink。",
  },
  {
    name: "Piglei",
    url: "https://www.piglei.com",
    description: "Python 编程经验分享，真的学到很多。",
  },
  {
    name: "aptX",
    url: "https://atpx.com",
    description: "主题很好看，阅读体验很好。",
  },
  {
    name: "rqdmap",
    url: "https://rqdmap.top",
    description: "各种各样的折腾经历和编程经验分享，主题很有特色。",
  },
];

export const SOCIALS: SocialObjects = [
  {
    name: "Github",
    href: "https://github.com/KrDw9ec4",
    linkTitle: `KrDw on Github`,
    active: true,
  },
  {
    name: "Mail",
    href: "hi@k1r.in",
    linkTitle: `发送邮件到 ${SITE.title}`,
    active: false,
  },
  {
    name: "WeChat",
    href: "https://s.k1r.in/wechat",
    linkTitle: `The Newest Posts on WeChat`,
    active: true,
  },
  {
    name: "RSS",
    href: "/rss.xml",
    linkTitle: `KrDw Publish RSS`,
    active: true,
  },
  {
    name: "Facebook",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on Facebook`,
    active: false,
  },
  {
    name: "Instagram",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on Instagram`,
    active: false,
  },
  {
    name: "LinkedIn",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on LinkedIn`,
    active: false,
  },
  {
    name: "Twitter",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on Twitter`,
    active: false,
  },
  {
    name: "Twitch",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on Twitch`,
    active: false,
  },
  {
    name: "YouTube",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on YouTube`,
    active: false,
  },
  {
    name: "WhatsApp",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on WhatsApp`,
    active: false,
  },
  {
    name: "Snapchat",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on Snapchat`,
    active: false,
  },
  {
    name: "Pinterest",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on Pinterest`,
    active: false,
  },
  {
    name: "TikTok",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on TikTok`,
    active: false,
  },
  {
    name: "CodePen",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on CodePen`,
    active: false,
  },
  {
    name: "Discord",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on Discord`,
    active: false,
  },
  {
    name: "GitLab",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on GitLab`,
    active: false,
  },
  {
    name: "Reddit",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on Reddit`,
    active: false,
  },
  {
    name: "Skype",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on Skype`,
    active: false,
  },
  {
    name: "Steam",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on Steam`,
    active: false,
  },
  {
    name: "Telegram",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on Telegram`,
    active: false,
  },
  {
    name: "Mastodon",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on Mastodon`,
    active: false,
  },
];
