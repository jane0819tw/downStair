console.clear()
// 向量方法 ----------------------------
// 1. 先建立vec2
class Vec2 {
  constructor(x,y){
    this.x = x || 0
    this.y = y || 0
  }
  add(v){
    return new Vec2(this.x+v.x,this.y+v.y)
  }
  sub(v){
    return new Vec2(this.x-v.x,this.y-v.y)
  }
  mul(mul){
    return new Vec2(this.x*mul,this.y*mul)
  }
  set(x,y){
    this.x = x
    this.y = y
    return this
  }
  move(x,y){
    this.x+=x
    this.y+=y
    return this
  }
  equal(v){
    return this.x==v.x && this.y==v.y
  }
  clone(){
    return new Vec2(this.x,this.y)
  }
  toString(){
    return `(${this.x} ,${this.y})`
  }
  get angle(){
    return Math.atan2(this.y,this.x)
  }
  get unit(){
    return this.mul(1/this.length)
  }
  get length(){
    return Math.sqrt(this.x*this.x+this.y*this.y)
  }
  
  set length(l){
    //let temp = this.unit.mul(l)
    this.set(this.unit.mul(l).x,this.unit.mul(l).y)
  }

}
var v = new Vec2(3,4)
var v2 = new Vec2(3,4)
console.log(v.unit)
console.log()
// 定義會用到的屬性
// 全局時間(次數)
var time = 0
var FPS = 30
var PI2 = Math.PI*2
var bgc = 'black'
// 控制器---------------------------
var controls = {
  start: false,
  slient: false,
  value: 0,
  FPS:FPS,
  side: 5
}
var gui = new dat.GUI()
gui.add(controls,'start').listen().onChange(value=>{
  if(value){
    loaded()
  }
})
gui.add(controls,'slient').listen().onChange(value=>{
  controls.slient = value
  
  document.getElementById('musicBg').volume = value?0:1
  
})
gui.add(controls,'value',-2,2).step(0.5).listen().onChange(value=>{
  controls.value = value
})
gui.add(controls,'FPS',15,120).step(15).listen().onChange(value=>{
  controls.FPS = value
})
gui.add(controls,'side',3,36).step(1).listen().onChange(value=>{
  controls.side = value
})
// 動畫----------------------------
var canvas = document.getElementById('mycanvas')
var ctx = canvas.getContext('2d')
var ww = canvas.width = window.innerWidth
var wh = canvas.height = window.innerHeight
// 自定會用到的ctx繪圖方法
ctx.circle = function(v,r){
  ctx.arc(0,0,r,0,PI2)
  ctx.fill()
}
ctx.line = function(v1,v2){
  ctx.moveTo(v1.x,v1.y)
  ctx.lineTo(v2.x,v2.y)
  ctx.stroke()
}
ctx.side = function(side,r){
  ctx.save()
    ctx.moveTo(r,0)
    for(var i=0;i<side;i++){
      ctx.rotate(PI2/side)
    ctx.lineTo(r,0)
    }
    ctx.stroke()
  ctx.restore()
}

// 動畫四大步驟
// 1. initCnanvas  // 2. init  // 3. update邏輯  // 4. draw 畫上去
function initCnanvas(){
  ww = canvas.width = window.innerWidth
  wh = canvas.height = window.innerHeight
}
function playSound(id){
  document.getElementById(id).currentTime=0
  document.getElementById(id).volume = controls.slient?0:1
  document.getElementById(id).play()
  
}
function pauseSound(id){
  document.getElementById(id).pause()
  document.getElementById(id).currentTime=0
}
class Stair {
  constructor(args){
    let def = {
      p: new Vec2(),
      v: new Vec2(0,-4),
      a: new Vec2(),
      width: 120,
      height: 25,
      type: 'normal',
      active: true,
      extraHeight: 0
      
    }
    Object.assign(def,args)
    Object.assign(this,def)
  }
  draw(){
    ctx.save()
      ctx.translate(this.p.x,this.p.y)
      ctx.fillStyle = '#ddd'
      ctx.fillText(this.type,0,40)
      if(this.type =='hurt' || this.type =='normal'){
        ctx.fillRect(-this.width/2,0,this.width,this.height)
      }
      if(this.type =='hurt'){
        ctx.translate(-this.width/2,0)
        ctx.beginPath()
        let span = this.width/16
        for(let i=0;i<=16;i++){
          //let h = 
          ctx.lineTo(i*span,i%2==0?0:-20)
        }
        ctx.closePath()
        ctx.fillStyle = '#62667c'
        ctx.fill()
        
      }
      if(this.type =='fade'){
        ctx.fillStyle = '#ffe500'
        ctx.fillRect(-this.width/2,0,this.width,this.height)
      }
      if(this.type =='fake'){
        ctx.fillStyle = time%20<10 ? 'rgba(255,255,255,0.5)' : '#000'
        ctx.fillRect(-this.width/2,0,this.width,this.height)
      }
      if(this.type =='move'){
        ctx.fillStyle = '#f70978'
        ctx.fillRect(-this.width/2,0,this.width,this.height)
      }
      if(this.type =='slideLeft' || this.type =='slideRight'){
        let span = this.width/16
        for(let i=0;i<16;i++){
          ctx.fillStyle = i%2==0 ? '#f24' : '#555'
          let delta = span*i+(this.type =='slideRight'?1:-1)*time%20
          if(delta<0){
            delta=0
          }
          if(delta>this.width-span){
            delta=this.width-span
          }
          ctx.fillRect(-this.width/2+delta,0,this.width/20,this.height)
        }
        
      }
      if(this.type =='jump'){
        ctx.fillStyle = '#0df409'
        ctx.fillRect(-this.width/2,0-this.extraHeight,this.width,6)
        ctx.fillRect(-this.width/2,this.height,this.width,6)
      }
    ctx.restore()
  }
  update(){
    this.p = this.p.add(this.v)
    this.v = this.v.add(this.a)
    // 判斷move的要移動
    if(this.type =='move'){
      this.p.x += Math.random()*40-20 
    }
    if(this.p.y<0){
      this.active=false
    }
  }
  step(player){
    
    // 直接把速度歸零，加速度每次更新都被這邊回復成0
    player.v.y = 0
    // 判斷彩的不是自己(自己那一塊採第一次的時候)
    if(game.player.lastBlock!=this){
      playSound('step')
      bgc = `hsl(${Math.floor(Math.random()*360)},80%,80%)`
      game.player.deltaPoint(1)
      if(this.type =='hurt'){
        playSound('hurt')
        game.player.deltaPoint(-3)
        game.redPanel = 0.5
        TweenMax.to(game,0.5,{redPanel: 0})
      }
      if(this.type =='jump'){
        playSound('jump')
        this.extraHeight = 10
        TweenMax.to(this,0.2,{extraHeight:0})
      }
      if(this.type =='slideLeft' || this.type =='slideRight'){
        playSound('transmiting')
        this.extraHeight = 10
        TweenMax.to(this,0.2,{extraHeight:0})
      }
      if(this.type =='move'){
        playSound('move')
      }
    }
    //更新各種類型的位置速度更動
    if(this.type !='fade'){
      player.p.y = this.p.y
      // 不同類型的處理
      if(this.type =='jump'){
        player.v.y = -15
      }
      if(this.type =='slideLeft'){
        player.p.x -= 3
      }
      if(this.type =='slideRight'){
        player.p.x += 3
      }
      
      
    }else{
      // type =='fade'
      // 把速度規0先
      player.p.y+=10
    }
    
  }
}
class Player {
  constructor(args){
    let def = {
      p: new Vec2(),
      v: new Vec2(),
      a: new Vec2(0,0.8),
      width: 40,
      height: 80,
      color: 'blue',
      blood: 10,
      maxBlood:10,
      lastBlock: null
    }
    Object.assign(def,args)
    Object.assign(this,def)
  }
  draw(){
    ctx.save()
      ctx.translate(this.p.x,this.p.y)
      ctx.fillStyle = this.color
      ctx.fillRect(-this.width/2,-this.height,this.width,this.height)
      ctx.beginPath()
      ctx.fillStyle = '#fff'
      ctx.arc(-10,-50,5,0,2*Math.PI)
      ctx.arc(10,-50,5,0,2*Math.PI)
      ctx.fill()
      ctx.beginPath()
      ctx.fillStyle = '#000'
      ctx.arc(-10,-50,3,0,2*Math.PI)
      ctx.arc(10,-50,3,0,2*Math.PI)
      ctx.fill()
      // 眉毛
      ctx.beginPath()
      ctx.fillStyle = 'green'
      ctx.fillRect(-15,-60,10,3)
      ctx.beginPath()
      ctx.fillStyle = 'green'
      ctx.fillRect(5,-60,10,3)
      // mouth
      ctx.beginPath()
      ctx.fillStyle = 'yellow'
      ctx.fillRect(-5,-25,10,5)
      // hand right
      ctx.beginPath()
      ctx.save()
        ctx.translate(this.width/2,-50)
        ctx.rotate(-Math.log(this.v.y/2))
        ctx.fillStyle = '#09f2ea'
        ctx.fillRect(0,0,10,40)
      ctx.restore()
      // hand left
      ctx.beginPath()
      ctx.save()
        ctx.translate(-this.width/2,-50)
        ctx.rotate(Math.log(this.v.y/2))
        ctx.fillStyle = '#09f2ea'
        ctx.fillRect(-10,0,10,40)
      ctx.restore()
    ctx.restore()
  }
  update(){
    this.p = this.p.add(this.v)
    this.v = this.v.add(this.a)
    
  }
  deltaPoint(point){
    console.log('delete point '+point)
    this.blood+=point
    // 點數太多
    if(this.blood>this.maxBlood){
      this.blood = this.maxBlood
    }
    // 沒有點數
    if(this.blood<0){
      // game over
      game.end()
      playSound('dead')
    }
  }
}
class Food {
  constructor(args){
    // 以圖形中心為中心
    let def = {
      p: new Vec2(),
      v: new Vec2(),
      a: new Vec2(),
      r: 20,
      type: 'mancu',
      active: true
    }
    Object.assign(def,args)
    Object.assign(this,def)
  }
  draw(){
    ctx.save()
    ctx.translate(this.p.x,this.p.y)
    
    if(this.type =='mancu'){
      // 外層
      ctx.arc(0,0,this.r,0,2*Math.PI) 
      ctx.fillStyle = '#9A4D51'
      ctx.fill()
      ctx.strokeStyle = '#543c3d'
      ctx.lineWidth = 3
      ctx.stroke()
      ctx.lineWidth = 1
      
      ctx.beginPath()
      ctx.save()
        let angle = 0
        while(angle<2*Math.PI){
          ctx.moveTo(0,0)
          ctx.lineTo(this.r-10,0)
          ctx.strokeStyle = '#000'
          ctx.lineStyle = 1
          ctx.stroke()
          ctx.arc(this.r-10,0,(this.r-10)/2,0,2*Math.PI)
          ctx.fillStyle = '#fff'
          ctx.fill()
          ctx.rotate(Math.PI/3)
          angle+= Math.PI/3
        }
      ctx.restore()
      // 內層
      ctx.beginPath()
      ctx.arc(0,0,this.r-10,0,2*Math.PI)
      ctx.fillStyle = '#fff'
      ctx.fill()
    }
    if(this.type =='tulian'){
      ctx.beginPath()
      ctx.save()
        // 梗
        ctx.moveTo(0,-this.r-30)
        ctx.lineTo(0,-this.r)
        ctx.moveTo(0,-this.r-15)
        ctx.lineTo(15,-this.r-15)
        ctx.lineWidth = 5
        ctx.strokeStyle = '#b76f12'
        ctx.stroke()
        ctx.lineWidth = 1
        // 刺刺的
        ctx.beginPath()
        for(let i=0;i<=30;i++){
          let len = i%2==0 ?0:5
          console.log(`${len} ${this.r}`)
          ctx.lineTo(len+this.r,0)
          ctx.rotate(2*Math.PI/30)
        }
        ctx.closePath()
        ctx.fillStyle = '#BAB130'
        ctx.fill()
      ctx.restore()
    }
    
    ctx.restore()
  }
  update(){
    this.p = this.p.add(this.v)
    this.v = this.v.add(this.a)
    if(this.p.y>wh){
      this.active = false
    }
  }
}
class Game {
  constructor(){
    this.player = null
    this.food = null
    this.stairs = []
    this.width = 700
    this.height = wh
    this.types = ['normal','jump','hurt','slideLeft','slideRight','fade','fake','move']
    this.keyStatus = {
      left: false,
      right: false
    }
    this.foodTypes = ['mancu','tulian']
    // 用來記錄到第幾階了
    this.time = 0
    this.playing = false
    this.redPanel = 0
    
  }
  draw(){
    // 把畫面一道中間
    ctx.save()
      ctx.translate(ww/2-game.width/2,0)
      // draw 上排的刺
      ctx.beginPath()
      let span = this.width/30
      for(let i=0;i<=30;i++){
        let h = i%2==0?0:30
        ctx.lineTo(i*span,h)
      }
      ctx.closePath()
      ctx.fillStyle = '#ddd'
      ctx.fill()
      // 話樓梯
      this.stairs.forEach(stair=>stair.draw())
      // 話玩家
      this.player.draw()
      // 話食物
      if(this.food){
        this.food.draw()
      }
      // graw grid
      ctx.beginPath()
      ctx.moveTo(0,0)
      ctx.lineTo(0,wh)
      ctx.moveTo(this.width,0)
      ctx.lineTo(this.width,wh)
      ctx.strokeStyle = '#fff'
      ctx.stroke()
    ctx.restore()
    // 話血量
    ctx.beginPath()
    for(let i=0;i<this.player.maxBlood;i++){
      ctx.fillStyle = i<this.player.blood ? '#f24':'rgba(255,255,255,0.3)'
      ctx.fillRect(20+i*20,30,10,20)
    }
    // 填寫成績
    ctx.beginPath()
    ctx.fillStyle = '#fff'
    ctx.font = '20px Ariel'
    ctx.fillText(`地下${Math.floor(this.time/75)}層`,30,80)
    ctx.font = '10px Ariel'
    // 紅色屏幕
    ctx.beginPath()
    ctx.fillStyle = `rgba(255,0,0,${this.redPanel})`
    ctx.fillRect(0,0,ww,wh)
    
  }
  update(){
    this.time ++
    // 加快玩家速度
    if(this.time%100==0){
      this.player.a.y+=0.001
    }
    // 1. 先更新完玩家部分
    this.player.update()
    // 判斷有沒有超出邊界(因為還要判萬扣血或結束遊戲，所以直接寫在這裡)
    // -left
    if(this.player.p.x-this.player.width/2<0){
      this.player.p.x=this.player.width/2
    }
    // -right
    if(this.player.p.x+this.player.width/2>this.width){
      this.player.p.x=this.width - this.player.width/2
    }
    // -top
    if(this.player.p.y-this.player.height<0){
      // 要給大疫點的p 不然會一直判斷撞到
      this.player.p.y = 30 + this.player.height
      // 要讓它有意點速度
      this.player.v.y = 2
      // 扣分數
      this.player.deltaPoint(-4)
      playSound('hurt')
      game.redPanel = 0.5
      TweenMax.to(game,0.5,{redPanel: 0})
    }
    //down
    if(this.player.p.y>wh){
      // game over
      game.end()
      playSound('dead')
      console.log('game over')
    }
    // 2. 更新樓梯垂直位置
    let touching = false
    this.stairs.forEach(stair=>{
      stair.update()
      // 檢查是否碰到彼此
      // 水平方向 玩家右邊>階梯左邊
      // 玩家左邊 < 階梯右邊
      if(this.player.p.x+this.player.width/2>stair.p.x-stair.width/2 && 
         this.player.p.x-this.player.width/2<stair.p.x+stair.width/2){
        // 玩家垂直方向
        if(this.player.p.y>stair.p.y && this.player.p.y<stair.p.y+stair.height+10){
          // 讓玩家站在階梯上
          if(stair.type!='fake'){
            stair.step(this.player)
            
            touching = true
            this.player.lastBlock = stair
            
          }else{
            // fake 聲音
            playSound('fake')
          }    
        }
      }
    })
    // 沒有碰到的時候
    if(!touching){
      pauseSound('transmiting')
      this.player.lastBlock = null
    }
    // 更新鍵盤控制玩家水平位置
    if(this.keyStatus.left){
      this.player.p.x-=8
    }
    if(this.keyStatus.right){
      this.player.p.x+=8
    }
    
    this.stairs = this.stairs.filter(stair=>stair.active)
    // food setting ---------------------
    if(!this.food){
      if(this.player.blood<5){
        
        this.food = new Food({
          type: 'mancu',
          p: new Vec2(Math.random()*game.width,0),
          v: new Vec2(0,5),
          r: 20
        })
      }else{
        this.food = new Food({
          type: 'tulian',
          p: new Vec2(Math.random()*game.width,0),
          v: new Vec2(0,10),
          r: 30
        })
      }
    }
    // check hit or not
    // y 方向
    if(this.food.p.y+this.food.r > this.player.p.y-this.player.height){
      // x方向
      if(this.food.p.x+this.food.r > this.player.p.x-this.player.width/2 && 
         this.food.p.x-this.food.r < this.player.p.x+this.player.width/2){
        let point = this.food.type == 'mancu'?3:-2
        this.player.deltaPoint(point)
        // 播放音量
        playSound(this.food.type)
        // 撞到就移除
        this.food.active = false
      }
    }
    // 更新並判斷掉出畫面就死亡
    this.food.update()
    if(this.food.active == false){
      this.food = null
    }
  }
  init(){
    this.stairs = []
    this.time = 0
    for(let i=0;i<wh/120;i++){
      let index = Math.floor(Math.random()*this.types.length)
      this.stairs.push(new Stair({
        p: new Vec2(Math.random()*this.width,i*120+50),
        type: this.types[index]
      }))
    }
    this.player = new Player({
      p: new Vec2(this.width/2,200)
    })
  }
  start(){
    this.playing = true
    this.init()
    $('#start').hide(1)
    playSound('musicBg')
  }
  end(){
    this.playing = false
    $('#start').show(1)
    pauseSound('musicBg')
  }
}
let game;

function init(){
  game = new Game()
  game.init()
}
function update(){
  FPS = controls.FPS
  if(game.playing){
    game.update()
    // 每隔一段時間 產生新的階梯
    if(time%30==0){
      let index = Math.floor(Math.random()*game.types.length)
      game.stairs.push(new Stair({
        p: new Vec2(Math.random()*game.width,wh-40),
        type: game.types[index]
      }))
    }
  }
  
  time++
  if(controls.start){
     setTimeout(update,1000/FPS)
  } 
}
function draw(){
  // bgc
  ctx.fillStyle = bgc
  ctx.fillRect(0,0,ww,wh)
    
    game.draw()
    
  
  ctx.save()
    ctx.translate(mousePos.x,mousePos.y)
    ctx.beginPath()
    ctx.fillStyle = 'red'
    ctx.circle(mousePos,3)
    let len = 20
    ctx.strokeStyle = 'red'
    ctx.line(new Vec2(-len,0),new Vec2(len,0))
    ctx.line(new Vec2(0,-len),new Vec2(0,len))
  ctx.restore()
  if(controls.start){
    requestAnimationFrame(draw)
  } 
}

function loaded(){
  initCnanvas()
  init()
  draw()
  update()
}
// 其他監聽事件----------------------------
// loaded
window.addEventListener('load',loaded)

// 畫布隨螢幕調整
window.addEventListener('resize',initCnanvas)

// 滑鼠事件----------------------------
var mousePos = new Vec2()
var mousePosDown = new Vec2()
var mousePosUp = new Vec2()

function mousedown(evt){
  mousePos.set(evt.x,evt.y)
  mousePosDown = mousePos.clone()
}
function mousemove(evt){
  mousePos.set(evt.x,evt.y)
  //console.log(mousePos)
}
function mouseup(evt){
  mousePos.set(evt.x,evt.y)
  mousePosUp = mousePos.clone()
}
// 滑鼠監聽事件 ----------------------------
canvas.addEventListener('mousedown',mousedown)
canvas.addEventListener('mousemove',mousemove)
canvas.addEventListener('mouseup',mouseup)
window.addEventListener('keyup',function(evt){
  // toLowerCase 轉小寫
  let key = evt.key.replace('Arrow','').toLowerCase()
  game.keyStatus[key] = false
})
window.addEventListener('keydown',function(evt){
  // toLowerCase 轉小寫
  let key = evt.key.replace('Arrow','').toLowerCase()
  game.keyStatus[key] = true
})