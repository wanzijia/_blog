module.exports = {
    base: '/',
    head: [
        ['link', { rel: 'icon', href: '/logo/logo.jpg' }]
    ],
    title: 'ZIJIA',
    dest: './dist', // 设置输出目录
    description: '子佳的博客',
    markdown: {
        lineNumbers: false
    },
    themeConfig: {
        // logo: 'logo/logo.jpg',
        nav: require("./nav"),
        // sidebar: "auto",
        sidebarDepth: 2, // 侧边栏显示2级
        sidebar: {
            '/js/promise/': [
                '',
            ],
            '/js/program/': [
                '',
                'oop',
                'this'
            ],
            '/js/browser/': [
                '',
                'event',
                'request'
            ],
            '/js/apiDoc/': [
                '',
            ],
            '/module/': [
                '',
            ],
            '/ts/': [
                '',
                'ts_exerise'
            ],
            '/engineered/': [
                '',
                'interview'
            ],
            '/vue/vue2/': [
                '',
            ],
            '/vue/vue3/': [
                '',
            ],
            '/vue/vuex/': [
                '',
            ],
            '/vue/vueRouter/': [
                '',
            ],
            '/interview/': [
                '',
            ],
            '/vue/principle/': [
                '',
            ],
            '/react/': [
                '',
            ],
            '/performanceOptimization/': [
                '',
            ]
        }
    },
    plugins: ['@vuepress/back-to-top']
}