Page({
	data: {
		images: [
			"https://wumuxuan-1253516064.cos.ap-shanghai.myqcloud.com/ccg/uni-app/guide_1.png",
			"https://wumuxuan-1253516064.cos.ap-shanghai.myqcloud.com/ccg/uni-app/guide_2.png",
			"https://wumuxuan-1253516064.cos.ap-shanghai.myqcloud.com/ccg/uni-app/guide_3.png",
		],
		headImages: [
			"https://wumuxuan-1253516064.cos.ap-shanghai.myqcloud.com/ccg/uni-app/guide_1_head.png",
			"https://wumuxuan-1253516064.cos.ap-shanghai.myqcloud.com/ccg/uni-app/guide_2_head.png",
			"https://wumuxuan-1253516064.cos.ap-shanghai.myqcloud.com/ccg/uni-app/guide_3_head.png",
		],
		backgroundColors: [
			"linear-gradient(180deg, #f4e8d5, #f3efe3)",
			"linear-gradient(180deg, #e3efe1, #f3efe3)",
			"linear-gradient(180deg, #f0eaf8, #f3efe3)",
		],
		current: 0,
		navBg: "",
		statusBarHeight: 0,
		navHeight: 64,
		guideBg: "linear-gradient(180deg, #f4e8d5, #f3efe3)",
	},
	onLoad() {
		try {
			const sys1 = wx.getSystemInfoSync() || {};
			const menu = wx.getMenuButtonBoundingClientRect
				? wx.getMenuButtonBoundingClientRect()
				: null;
			const statusBarHeight = sys1.statusBarHeight || 20;
			let navHeight = statusBarHeight + 44;
			if (menu && menu.top && menu.height) {
				navHeight =
					(menu.top - statusBarHeight) * 2 + menu.height + statusBarHeight;
			}
			this.setData({ statusBarHeight, navHeight });

			const sys2 = wx.getSystemInfoSync() || {};
			const targetW = Math.min(
				1440,
				Math.ceil((sys2.windowWidth || 375) * (sys2.pixelRatio || 2.5) * 1.05),
			);
			const toHiDpi = (u) => {
				if (!/^https?:\/\//.test(u)) return u;
				const sep = u.includes("?") ? "&" : "?";
				return `${u}${sep}imageMogr2/auto-orient/thumbnail/${targetW}x/quality/92/format/webp`;
			};
			const imgs = (this.data.images || []).map(toHiDpi);
			const headsSrc =
				Array.isArray(this.data.headImages) && this.data.headImages.length
					? this.data.headImages
					: imgs;
			const heads = headsSrc.map(toHiDpi);
			this.setData({
				images: imgs,
				headImages: heads,
				navBg: heads[0] || imgs[0] || "",
			});
		} catch (_) {}
	},
	onChange(e) {
		const cur = Number(e && e.detail && e.detail.current) || 0;
		const pics = Array.isArray(this.data.images) ? this.data.images : [];
		const heads = Array.isArray(this.data.headImages)
			? this.data.headImages
			: pics;
		const bgColors = Array.isArray(this.data.backgroundColors)
			? this.data.backgroundColors
			: [];
		this.setData({
			current: cur,
			navBg: heads[cur] || heads[0] || pics[cur] || pics[0] || this.data.navBg,
			guideBg: bgColors[cur] || bgColors[0] || this.data.guideBg,
		});
	},
	onNext() {
		const next = this.data.current + 1;
		if (next < this.data.images.length) {
			const bgColors = Array.isArray(this.data.backgroundColors)
				? this.data.backgroundColors
				: [];
			this.setData({
				current: next,
				guideBg: bgColors[next] || bgColors[0] || this.data.guideBg,
			});
		}
	},
	onPrev() {
		const prev = this.data.current - 1;
		if (prev >= 0) {
			const bgColors = Array.isArray(this.data.backgroundColors)
				? this.data.backgroundColors
				: [];
			this.setData({
				current: prev,
				guideBg: bgColors[prev] || bgColors[0] || this.data.guideBg,
			});
		}
	},
	onSkip() {
		this.onDone();
	},
	onDone() {
		try {
			wx.setStorageSync("guideDone", true);
		} catch (_) {}
		wx.switchTab({ url: "/pages/chat/chat" });
	},
});
