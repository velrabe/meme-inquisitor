const HUD_STYLE = {
  fontFamily: 'Arial, sans-serif',
  fontSize: '22px',
  color: '#f4f4f4',
};

export class Hud {
  constructor(scene) {
    this.scene = scene;

    this.timeText = scene.add.text(24, 20, '', HUD_STYLE).setOrigin(0, 0).setDepth(1000);
    this.scoreText = scene.add.text(270, 20, '', HUD_STYLE).setOrigin(0.5, 0).setDepth(1000);
    this.barrierText = scene.add.text(516, 20, '', HUD_STYLE).setOrigin(1, 0).setDepth(1000);
  }

  bind(session) {
    this.session = session;
    this.unsubscribe = (payload) => this.update(payload);
    session.events.on('hud', this.unsubscribe);
    this.update(session.getHudState());
  }

  update(state) {
    const seconds = Math.ceil(Math.max(0, state.remainingTime));
    this.timeText.setText(`Время ${seconds}`);
    this.scoreText.setText(`${state.score}`);
    this.barrierText.setText(`Баррикада ${state.barrierDurability}/${state.barrierMax}`);
  }

  destroy() {
    if (this.session && this.unsubscribe) {
      this.session.events.off('hud', this.unsubscribe);
    }

    this.timeText.destroy();
    this.scoreText.destroy();
    this.barrierText.destroy();
  }
}
