/*
 * @Desc:
 * @Author: 曾茹菁
 * @Date: 2022-07-27 14:58:43
 * @LastEditors: 曾茹菁
 * @LastEditTime: 2022-07-27 17:03:18
 */
// https://pixijs.download/release/docs/PIXI.Container.html
// https://github.com/greensock/GSAP
const imgs = [
  ["btn.png", "images/btn.png"],
  ["btn_circle.png", "images/btn_circle.png"],
  ["brake_bike.png", "images/brake_bike.png"],
  ["brake_handlerbar.png", "images/brake_handlerbar.png"],
  ["brake_lever.png", "images/brake_lever.png"],
];
class BrakeBanner {
  speed = 0;
  particles = [];
  constructor(selector) {
    //创建资源加载器
    this.loader = new PIXI.Loader();
    // 初始化应用
    this.app = new PIXI.Application({
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0xffffff,
      resizeTo: window,
    });
    this.stage = this.app.stage;
    document.querySelector(selector).appendChild(this.app.view);
    this.loadImgs();
  }
  /**
   * @description: 载入资源
   */
  loadImgs() {
    imgs.forEach(([key, value]) => {
      this.loader.add(key, value);
    });
    this.loader.load();
    this.loader.onComplete.add(() => {
      this.show();
    });
  }
  /**
   * @description: 获取载入的图片
   * @param {*} key
   * @return {*}
   */
  getImg(key) {
    // 通过图片创建精灵元素
    return new PIXI.Sprite(this.loader.resources[key].texture);
  }
  show() {
    const userBtn = this.createBtn();
    const { bike, bikeLever } = this.createBike();
    this.stage.addChild(bike);
    this.stage.addChild(userBtn);
    const { pContainer } = this.createParticle();
    this.stage.addChild(pContainer);
    this.start();
    this.addEvent(userBtn, bikeLever, bike);
  }

  /**
   * @description: 创建自行车按钮
   * @return {*}
   */
  createBtn() {
    let btnContainer = new PIXI.Container();
    // 设置按钮容器大小
    btnContainer.x = 300;
    btnContainer.y = 300;
    // 获取图片资源并将图片加进画面
    const btnImg = this.getImg("btn.png"),
      btnCircleImg1 = this.getImg("btn_circle.png"),
      btnCircleImg2 = this.getImg("btn_circle.png");
    btnContainer.addChild(btnImg);
    btnContainer.addChild(btnCircleImg1);
    btnContainer.addChild(btnCircleImg2);
    // console.log(btnImg, btnCircleImg1, btnCircleImg2);
    // 圆圈居中 (设置转换中心点) pivot : 此显示对象在其本地空间中的旋转、缩放和倾斜中心。 By default, the pivot is the origin (0, 0).
    btnImg.pivot.x = btnImg.pivot.y = btnImg.width / 2;
    btnCircleImg1.pivot.x = btnCircleImg1.pivot.y = btnCircleImg1.width / 2;
    btnCircleImg2.pivot.x = btnCircleImg2.pivot.y = btnCircleImg2.width / 2;
    // 缩小第一个外环
    btnCircleImg1.scale.x = btnCircleImg1.scale.y = 0.8;
    // 用gsap 创建动效
    gsap.to(btnCircleImg1, { duration: 1, alpha: 0, repeat: -1 });
    gsap.to(btnCircleImg1.scale, { duration: 1, x: 1.1, y: 1.1, repeat: -1 });
    return btnContainer;
  }
  /**
   * @description: 创建自行车
   * @return {*}
   */
  createBike() {
    const bikeContainer = new PIXI.Container();
    // 缩小
    bikeContainer.scale.x = bikeContainer.scale.y = 0.3;
    const bikeImage = this.getImg("brake_bike.png"), // 车身
      bikeHandlerImage = this.getImg("brake_handlerbar.png"), // 车把手
      bikeLeverImage = this.getImg("brake_lever.png"); // 刹车手
    bikeContainer.addChild(bikeImage);
    bikeContainer.addChild(bikeHandlerImage);
    bikeContainer.addChild(bikeLeverImage);
    // 把刹车手的位置跳过去
    bikeLeverImage.x = 255 + 454;
    bikeLeverImage.y = 450 + 462;
    bikeLeverImage.pivot.x = 454;
    bikeLeverImage.pivot.y = 462;
    // 旋转
    bikeLeverImage.rotation = (Math.PI / 180) * -35;
    // this.bikeLeverObj = bikeLeverImage;
    return { bike: bikeContainer, bikeLever: bikeLeverImage };
  }
  /**
   * @description: 创建粒子
   * @return {*}
   */
  createParticle() {
    const pSize = window.innerWidth,
      colors = [0xf1cf54, 0xb5cea8, 0xf1cf54, 0x818181, 0x000000],
      pContainer = new PIXI.Container();
    for (let index = 0; index < 10; index++) {
      const gr = new PIXI.Graphics(); // 将基本形状（如线条、圆形和矩形）渲染到显示器，并为它们着色和填充。
      gr.beginFill(colors[Math.floor(Math.random() * colors.length)]);
      gr.drawCircle(0, 0, 6); // x,y,r
      gr.endFill();
      const parItem = {
        sx: Math.random() * pSize,
        sy: Math.random() * pSize,
        gr: gr,
      };
      gr.x = parItem.sx;
      gr.y = parItem.sy;
      pContainer.addChild(gr);
      this.particles.push(parItem);
    }
    // 旋转粒子容器 使粒子斜着移动
    pContainer.pivot.set(pSize / 2, pSize / 2);
    pContainer.rotation = (35 * Math.PI) / 180;
    pContainer.x = pSize / 2;
    pContainer.y = pSize / 2;
    return { pContainer };
  }
  addEvent(userBtn, bikeLever, bike) {
    userBtn.interactive = true;
    userBtn.buttonMode = true;
    userBtn.on("mousedown", () => {
      gsap.to(bikeLever, {
        duration: 0.4,
        rotation: (Math.PI / 180) * -30,
      });
      this.pause();
    });
    userBtn.on("mouseup", () => {
      gsap.to(bikeLever, { duration: 0.4, rotation: 0 });
      this.start();
    });
    // 车体置于右下角
    const resize = () => {
      bike.x = window.innerWidth - bike.width;
      bike.y = window.innerHeight - bike.height;
    };
    window.addEventListener("resize", resize);
    resize();
  }
  /**
   * @description: 粒子动画
   * @return {*}
   */
  loop = () => {
    this.speed += 0.5;
    this.speed = Math.min(this.speed, 20);

    for (let i = 0; i < this.particles.length; i++) {
      // 拿到粒子item和小圆点实例
      let pItem = this.particles[i];
      pItem.gr.y += this.speed;
      // 当一个球体高速运动时，会被拉长，所以放大y轴
      if (this.speed >= 20) {
        pItem.gr.scale.y = 40;
        pItem.gr.scale.x = 0.03;
      }
      // //当粒子移动超出范围时回到顶部
      if (pItem.gr.y > window.innerHeight) pItem.gr.y = 0;
    }
  };
  /**
   * @description: 开始粒子动画
   * @return {*}
   */
  start = () => {
    this.speed = 0;
    gsap.ticker.add(this.loop);
  };
  /**
   * @description: 停止粒子动画
   * @return {*}
   */
  pause = () => {
    gsap.ticker.remove(this.loop);
    for (let i = 0; i < this.particles.length; i++) {
      let pItem = this.particles[i];
      let gr = pItem.gr;

      //恢复小圆点的拉伸比例
      gr.scale.x = gr.scale.y = 1;
      //恢复小圆点透明度
      gr.alpha = 1;
      //让所有的小圆点使用弹性补间动画回到初始坐标
      gsap.to(gr, {
        duration: 0.6,
        x: pItem.sx,
        y: pItem.sy,
        ease: "elastic.out",
      });
    }
  };
}
