const Applet = imports.ui.applet;
const Util = imports.misc.util;
const GLib = imports.gi.GLib;

function run(cmd) {
    try {
        let [result, stdout, stderr] = GLib.spawn_command_line_sync(cmd);
        if (stdout !== null) {
            return stdout.toString();
        }
    } catch (error) {
        global.logError(error.message);
    }
}

function getCurrentDevice() {
    const output = run('pactl list sinks');
    const lines = output.split('\n');
    for (let i = 0; i < lines.length; i += 1) {
        const line = lines[i];
        if (line.includes('Active Port')) {
            const columns = line.split(' ');
            return columns[2];
        }
    }

    throw new Error('Couldn\'t find current audio device');
}

function switchDevices() {
    const device = getCurrentDevice();

    // Defaults
    let targetDevice = 'analog-output-headphones';
    let deviceToDisable = 'Front';
    let deviceToEnable = 'Headphone';
    let deviceNotifyName = 'speakers';

    if (device === 'analog-output-headphones') {
        targetDevice = 'analog-output-lineout';
        deviceToDisable = 'Headphone';
        deviceToEnable = 'Front';
        deviceNotifyName = 'headphones';
    }

    GLib.spawn_command_line_async(`pactl set-sink-port 0 ${targetDevice}`);
    GLib.spawn_command_line_async(`amixer -c0 set ${deviceToDisable} 0%`);
    GLib.spawn_command_line_async(`amixer -c0 set ${deviceToEnable} 100%`);
    GLib.spawn_command_line_async(`notify-send --hint=int:transient:1 -t 2000 "Sound Switch" "Sound output switched to ${deviceNotifyName}"`);
}

class MyApplet extends Applet.IconApplet {
    constructor(orientation, panelHeight, instanceId) {
        super(orientation, panelHeight, instanceId);
        
        this.updateIcon = this.updateIcon.bind(this);
        this.updateIcon();
        this.set_applet_tooltip(_('Click to switch audio devices'));
    }

    updateIcon() {
        const currentDevice = getCurrentDevice();
        if (currentDevice === 'analog-output-lineout') {
            this.set_applet_icon_symbolic_name('audio-headphones');
        } else {
            this.set_applet_icon_symbolic_name('multimedia-volume-control');
        }
    }

    on_applet_clicked() {
        global.log('Switching audio devices');
        switchDevices();
        this.updateIcon();
    }
}

function main(metadata, orientation, panelHeight, instanceId) {
    return new MyApplet(orientation, panelHeight, instanceId);
}
