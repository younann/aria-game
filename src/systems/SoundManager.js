import { Howl } from "howler";

const sounds = {};

export function registerSound(name, src, options = {}) {
  sounds[name] = new Howl({ src: [src], volume: 0.5, ...options });
}

export function playSound(name) {
  if (sounds[name]) sounds[name].play();
}

export function stopSound(name) {
  if (sounds[name]) sounds[name].stop();
}

export function setVolume(name, vol) {
  if (sounds[name]) sounds[name].volume(vol);
}
