// SceneStartCountdown
class SceneStartCountdown extends Phaser.Scene {

	constructor (){
	    	super({ key: 'SceneStartCountdown', active: false });
	}

	preload(){
		}

	create(){
		// background colour
		this.cameras.main.setBackgroundColor('#FFFFFF'); //#FFFFFF == 'white'

		// start image
		let startImg = this.add.image(configWidth/2, configHeight/2, 'startImg').setAlpha(0);
		let tween;

		//  Texts
	    let title = this.add.text(configWidth/2, configHeight/2, '5', { fontSize: '36px', fill: '#000', fontstyle: 'bold' });

	    tween = this.tweens.add({
	        targets: startImg,
	        alpha: { value: 0.9, duration: 1500, ease: 'Power1' },
	        scale: { value: 3, duration: 1500, ease: 'Power1' },
	        delay: 5000,
	        yoyo: true,
	        loop: -1
	    });

	    setTimeout(function(){
            title.setText('4');
        },1000);
        setTimeout(function(){
            title.setText('3');
        },2000);
        setTimeout(function(){
            title.setText('2');
        },3000);
        setTimeout(function(){
            title.setText('1');
        },4000);
        setTimeout(function(){
        	//let startImg = this.add.sprite(configWidth/2, configHeight/2, 'startImg').setAlpha(0);
        	title.destroy();

        	//this.add.tween(startImg).to( { alpha: 1 }, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);
        }, 5000);
        setTimeout(function(){
            game.scene.start('SceneMain');
        },6500);
	}

	update(){}
};

