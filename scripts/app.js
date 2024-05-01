let config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 640,
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 300 },
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
let player;
let stars;
let bombs;
let score = 0;
let scoreText;
let cursors;
let playerColorIndex = 0; // Index for player color change
const playerColors = [0xff0000, 0xffa500, 0xffff00, 0x00ff00, 0x0000ff, 0x4b0082, 0xee82ee]; // Colors in RGB format
let starsCollected = 0;

function preload() {
    // Load images
    this.load.image("bg", "assets/img/bg.png");
    this.load.image("ground", "assets/img/platform.png");
    this.load.image("star", "assets/img/star.png");
    this.load.image("bomb", "assets/img/bomb.png");
    this.load.spritesheet("dude", "assets/img/dude.png", { frameWidth: 32, frameHeight: 48 });
}

function create() {
    this.physics.world.createDebugGraphic();

    // Add background image
    this.add.image(0, 0, "bg").setOrigin(0, 0);

    // Add platforms
    platforms = this.physics.add.staticGroup();
    platforms.create(400, 570, "ground").setScale(1.65).refreshBody(); // Ground platform
    platforms.create(850, 400, "ground").setScale(0.65).refreshBody(); // Bottom platform
    platforms.create(60, 275, "ground").setScale(0.65).refreshBody(); // Middle platform
    platforms.create(950, 150, "ground").setScale(0.65).refreshBody(); // Top platform

    // Add player
    player = this.physics.add.sprite(100, 450, "dude");
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);
    player.setTint(playerColors[playerColorIndex]);

    // Player movement animations
    this.anims.create({
        key: "left",
        frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: "turn",
        frames: [{ key: "dude", frame: 4 }],
        frameRate: 20
    });

    this.anims.create({
        key: "right",
        frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    // Add stars
    stars = this.physics.add.group({
        key: "star",
        repeat: 10,
        setXY: { x: 12, y: 0, stepX: 70 }
    });

    stars.children.iterate(function (child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        child.setScale(0.025);
        child.setCollideWorldBounds(true);
    });

    // Add bombs
    bombs = this.physics.add.group();

    // Add score text
    scoreText = this.add.text(16, 16, "Score: 0", { fontSize: "32px", fill: "#000" });

    // Colliders
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(stars, platforms);
    this.physics.add.collider(bombs, platforms);
    this.physics.add.overlap(player, stars, collectStar, null, this);
    this.physics.add.overlap(player, bombs, hitBomb, null, this);

    // Cursors
    cursors = this.input.keyboard.createCursorKeys();
}

function update() {
    this.physics.world.debugGraphic.clear();
    this.physics.world.debugGraphic.visible = false;

    // Cursor Controls
    if (cursors.left.isDown) {
        player.setVelocityX(-200);
        player.anims.play("left", true);
    } else if (cursors.right.isDown) {
        player.setVelocityX(200);
        player.anims.play("right", true);
    } else {
        player.setVelocityX(0);
        player.anims.play("turn");
    }

    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-300);
    }
}

function collectStar(player, star) {
    star.disableBody(true, true);
    score += 10;
    scoreText.setText("Score: " + score);

    starsCollected++;
    if (starsCollected % 5 === 0) {
        spawnBomb();
        increasePlayerSize();
    }

    changePlayerColor();
    spawnStar();
}

function spawnStar() {
    let x = Phaser.Math.Between(0, config.width);
    let star = stars.create(x, 0, "star");
    star.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    star.setScale(0.025);
}

function spawnBomb() {
    let x = Phaser.Math.Between(0, config.width);
    let bomb = bombs.create(x, 0, "bomb");
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    bomb.setScale(0.025);
}

function changePlayerColor() {
    playerColorIndex = (playerColorIndex + 1) % playerColors.length;
    player.setTint(playerColors[playerColorIndex]);
}

function increasePlayerSize() {
    player.setScale(player.scaleX + 0.1, player.scaleY + 0.1);
}

function hitBomb(player, bomb) {
    score -= 10;
    scoreText.setText("Score: " + score);
    bomb.disableBody(true, true);
}
