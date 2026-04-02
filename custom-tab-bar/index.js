Component({
  data: {
    selected: 0,
    color: "#666666",
    selectedColor: "#ff7a3f",
    list: [
      {
        pagePath: "/pages/market/market",
        iconPath: "../images/tabbar2.png",
        selectedIconPath: "../images/tabbar2_s.png",
        text: "礼物集市"
      },
      {
        pagePath: "/pages/chat/chat",
        iconPath: "../images/tabbar12.png",
        selectedIconPath: "../images/tabbar1_s2.png",
        text: ""
      },
      {
        pagePath: "/pages/my/my",
        iconPath: "../images/tabbar3.png",
        selectedIconPath: "../images/tabbar3_s.png",
        text: "会员管家"
      }
    ]
  },
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset;
      const url = data.path;
      wx.switchTab({
        url
      });
      this.setData({
        selected: data.index
      });
    }
  }
})