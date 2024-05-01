let config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 640,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 300},
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

let game = new Phaser.Game(config);
let platforms;

function preload (){
    // Load images
    this.load.image("bg", "assets/img/bg.png");
    this.load.image("ground", "assets/img/platform.png");
    this.load.image("star", "assets/img/star.png");
    this.load.image("bomb", "assets/img/bomb.png");
    this.load.spritesheet("dude", "assets/img/dude.png", {frameWidth: 32, frameHeight: 48});
}

function create (){
    // Add background image
    this.add.image(0, 0, "bg").setOrigin(0, 0);
    
    // Add platforms
    platforms = this.physics.add.staticGroup();
    platforms.create(400, 570, "ground").setScale(1.65).refreshBody(); // Ground platform
    platforms.create(850, 400, "ground").setScale(0.65); // Bottom platform
    platforms.create(60, 275, "ground").setScale(0.65); // Middle platform
    platforms.create(850, 150, "ground").setScale(0.65); // Top platform
}

function update (){

}