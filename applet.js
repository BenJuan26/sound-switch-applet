const Applet = imports.ui.applet;
const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;

const settingsSchemaId = 'com.benjuan26.soundswitch';
const settingsKey = 'device';
const notificationDuration = '2000';
const notificationTitle = 'Sound Switch';

function oppositeDevice(currentDevice) {
    if (currentDevice === 'analog-output-headphones') {
        return 'analog-output-lineout';
    }

    return 'analog-output-headphones';
}

function setDevice(device) {
    // Defaults
    let deviceToDisable = 'Front';
    let deviceToEnable = 'Headphone';
    let deviceNotifyName = 'speakers';

    if (device === 'analog-output-lineout') {
        deviceToDisable = 'Headphone';
        deviceToEnable = 'Front';
        deviceNotifyName = 'headphones';
    }

    GLib.spawn_command_line_async(`pactl set-sink-port 0 ${device}`);
    GLib.spawn_command_line_async(`amixer -c0 set "Auto-Mute Mode" Disabled`);
    GLib.spawn_command_line_async(`amixer -c0 set ${deviceToDisable} 0%`);
    GLib.spawn_command_line_async(`amixer -c0 set ${deviceToEnable} 100%`);
    GLib.spawn_command_line_async(`notify-send --hint=int:transient:1 -t ${notificationDuration} "${notificationTitle}" "Sound output switched to ${deviceNotifyName}"`);
}

class MyApplet extends Applet.IconApplet {
    constructor(orientation, panelHeight, instanceId) {
        super(orientation, panelHeight, instanceId);

        this._settings = new Gio.Settings({ schema_id: settingsSchemaId });
        const device = this._settings.get_string(settingsKey);

        this.updateIcon = this.updateIcon.bind(this);
        this.updateIcon(device);
        this.set_applet_tooltip(_('Click to switch audio devices'));

        this.settingsConnectId = this._settings.connect(`changed::${settingsKey}`, () => { this.onSettingsChanged(); });
    }

    updateIcon(device) {
        if (device === 'analog-output-lineout') {
            this.set_applet_icon_symbolic_name('audio-headphones');
        } else {
            this.set_applet_icon_symbolic_name('multimedia-volume-control');
        }
    }

    on_applet_clicked() {
        global.log('Sound switch clicked');
        const device = this._settings.get_string('device');
        this._settings.set_string(settingsKey, oppositeDevice(device));
    }

    onSettingsChanged() {
        const device = this._settings.get_string('device');
        global.log(`Updating sound output device to ${device} based on settings change`);

        setDevice(device);
        this.updateIcon(device);
    }
}

function main(metadata, orientation, panelHeight, instanceId) {
    return new MyApplet(orientation, panelHeight, instanceId);
}
