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
let playerColorIndex = 0;
const playerColors = [0xff0000, 0xffa500, 0xffff00, 0x00ff00, 0x0000ff, 0x4b0082, 0xee82ee]; // Colors in RGB format
let starsCollected = 0;
let coinSound;
let jumpSound;
let bombSound;
let bgm;

function preload() {
    // Load images
    this.load.image("bg", "assets/img/bg.png");
    this.load.image("ground", "assets/img/platform.png");
    this.load.image("star", "assets/img/star.png");
    this.load.image("bomb", "assets/img/bomb.png");
    this.load.spritesheet("dude", "assets/img/dude.png", { frameWidth: 32, frameHeight: 48 });

    // Load audio
    this.load.audio("coinSound", "assets/mp3/Mario coin sfx.mp3");
    this.load.audio("jumpSound", "assets/mp3/Mario jump sfx.mp3");
    this.load.audio("bombSound", "assets/mp3/Small bomb explode sfx.mp3");
    this.load.audio("bgm", "assets/mp3/bgm - Ninja Toad.mp3");
}

function create() {
    this.physics.world.createDebugGraphic();

    // Add audio
    coinSound = this.sound.add("coinSound");
    jumpSound = this.sound.add("jumpSound");
    bombSound = this.sound.add("bombSound");
    bgm = this.sound.add("bgm", { loop: true });
    bgm.play();

    // Audio volume
    coinSound.setVolume(0.25);
    jumpSound.setVolume(0.25);
    bombSound.setVolume(0.5); 

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
    scoreText = this.add.text(16, 16, "Stars Collected: 0", { fontSize: "20px", fill: "#FFF" });

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
    // Fix debug world
    this.physics.world.debugGraphic.clear();
    this.physics.world.debugGraphic.visible = false;

    // Cursor controls
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
        player.setVelocityY(-500);
        jumpSound.play();
    }
}

function collectStar(player, star) {
    star.disableBody(true, true);
    score += 1;
    scoreText.setText("Stars Collected: " + score);
    coinSound.play();

    starsCollected++;
    if (starsCollected % 10 === 0) {
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
    // Make player invisible
    player.setVisible(false);

    // Play bomb sound effect
    bombSound.play();

    // Disable bomb physics body
    bomb.disableBody(true, true);

    // Display "GAME OVER" text
    let gameOverText = this.add.text(config.width / 2, config.height / 2, "GAME OVER", {
        fontSize: "50px",
        fill: "#fff",
        align: "center",
        fontWeight: 'bold'
    });
    gameOverText.setOrigin(0.5);

    // Add restart button
    let restartButton = this.add.text(config.width / 2, config.height / 2 + 100, "Restart", {
        fontSize: "25px",
        fill: "#bf0000",
        align: "center",
        fontWeight: 'bold',
        padding: {
            x: 10,
            y: 10
        },
        backgroundColor: "#f00"
    });
    restartButton.setOrigin(0.5);
    restartButton.setInteractive();

    restartButton.on("pointerover", () => {
        // Change button style on hover
        restartButton.setStyle({
            fill: "#000",
            backgroundColor: "#800000",
            padding: {
                x: 12,
                y: 12
            }
        });
    });

    restartButton.on("pointerout", () => {
        // Revert button style when not hovered
        restartButton.setStyle({
            fill: "#fff",
            backgroundColor: "#f00",
            padding: {
                x: 10,
                y: 10
            }
        });
    });

    restartButton.on("pointerup", () => {
        // Reset player position
        player.setVisible(true);
        player.setX(100);
        player.setY(450);

        // Reset player size
        player.setScale(1);

        // Reset score
        score = 0;
        scoreText.setText("Stars Collected: " + score);

        // Remove "GAME OVER" text and restart button
        gameOverText.destroy();
        restartButton.destroy();

        // Remove bombs from the scene
        bombs.clear(true, true);
    });
}