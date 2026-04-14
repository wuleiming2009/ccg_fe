const ccgapi = require("../../api/ccgapi");

Page({
	data: {
		items: [],
		page: 1,
		hasMore: true,
		loading: false,
		palette: ["#8CB4B4", "#BFD6D6", "#A6C8C8", "#8FAFAD", "#9EC3BE"],
		keyword: '',
		isSearch: false,
	},
	onLoad() {
		wx.showShareMenu({ withShareTicket: true });
	},
	onShow() {
		if (typeof this.getTabBar === "function" && this.getTabBar()) {
			wx.nextTick(() => {
				this.getTabBar().setData({
					selected: 0,
				});
			});
		}
	},
	onReady() {
		this.fetchPage(1);
	},
	async fetchPage(p) {
		if (this.data.loading) return;
		this.setData({ loading: true });
		try {
			const resp = await ccgapi.marketList({ page: p });
			const list = (resp.list || []).map((it, idx) => ({
				product_id: it.product_id || 0,
				img_url: it.img_url,
				pictures: it.pictures || "",
				name: it.name,
				price: it.price,
				market_price: it.market_price,
				slogan: it.slogan || "",
				contents: it.contents || "",
				scene: it.scene || "",
				keywords: it.keywords || "",
				suitable_for: it.suitable_for || "",
				brand_info: it.brand_info || it.brand_name || "",
				likes: Number(it.likes) || 0,
				match_text: it.match_text,
				match_meaning: it.match_meaning,
			}));
			const items = p === 1 ? list : this.data.items.concat(list);
			this.setData({ items, page: p, hasMore: list.length > 0 });
		} catch (e) {
			wx.showToast({ title: "加载市集失败", icon: "none" });
		} finally {
			this.setData({ loading: false });
		}
	},
	onOpenDetail(e) {
		const idx = Number(e.currentTarget.dataset.index);
		const item = this.data.items[idx];
		if (!item) return;
		wx.navigateTo({
			url: "/pages/product/product",
			success: (res) => {
				res.eventChannel && res.eventChannel.emit("product", item);
			},
		});
	},
	onKeywordInput(e) {
		this.setData({ keyword: e.detail.value });
	},
	onSearch() {
		const keyword = (this.data.keyword || '').trim();
		this.setData({ isSearch: !!keyword, page: 1, items: [] });
		if (keyword) {
			this.fetchSearch(1, keyword);
		} else {
			this.fetchPage(1);
		}
	},
	async fetchSearch(p, keyword) {
		if (this.data.loading) return;
		this.setData({ loading: true });
		try {
			const resp = await ccgapi.productSearch({ keyword, page: p });
			const list = (resp.list || []).map((it, idx) => ({
				product_id: it.product_id || 0,
				img_url: it.img_url,
				pictures: it.pictures || "",
				name: it.name,
				price: it.price,
				market_price: it.market_price,
				slogan: it.slogan || "",
				contents: it.contents || "",
				scene: it.scene || "",
				keywords: it.keywords || "",
				suitable_for: it.suitable_for || "",
				brand_info: it.brand_info || it.brand_name || "",
				likes: Number(it.likes) || 0,
				match_text: it.match_text,
				match_meaning: it.match_meaning,
			}));
			const items = p === 1 ? list : this.data.items.concat(list);
			this.setData({ items, page: p, hasMore: list.length > 0 });
		} catch (e) {
			wx.showToast({ title: "搜索失败", icon: "none" });
		} finally {
			this.setData({ loading: false });
		}
	},
	onReachBottom() {
		if (!this.data.hasMore) return;
		if (this.data.isSearch) {
			this.fetchSearch(this.data.page + 1, this.data.keyword);
		} else {
			this.fetchPage(this.data.page + 1);
		}
	},
	onPullDownRefresh() {
		if (this.data.isSearch) {
			this.fetchSearch(1, this.data.keyword).finally(() => wx.stopPullDownRefresh());
		} else {
			this.fetchPage(1).finally(() => wx.stopPullDownRefresh());
		}
	},
	onShareAppMessage() {
		return { title: "CC GIFT 礼物集市", path: "/pages/market/market" };
	},
});
