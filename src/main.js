import Phaser from 'phaser';
import { createGameConfig } from './config/gameConfig.js';
import { BootScene } from './scenes/BootScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { ShopScene } from './scenes/ShopScene.js';
import { GameScene } from './scenes/GameScene.js';
import { ResultScene } from './scenes/ResultScene.js';
import './styles.css';

const game = new Phaser.Game(
  createGameConfig([BootScene, MenuScene, ShopScene, GameScene, ResultScene]),
);

export default game;
