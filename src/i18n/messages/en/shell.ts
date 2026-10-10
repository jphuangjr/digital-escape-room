const messages = {
  "shell.app.browser": "Browser",
  "shell.app.notes": "Notes",
  "shell.app.email": "Email",
  "shell.app.files": "Files",
  "shell.app.decoder": "Decoder",
  "shell.dock.label": "Dock",
  "shell.dock.appAria": "{app}{locked, select, true { (locked)} other {}}{unread, plural, =0 {} one {, # unread} other {, # unread}}",
  "shell.dock.room": "Room",
  "shell.dock.roomAria": "Room: {online} online{unread, plural, =0 {} one {, # unread message} other {, # unread messages}}",
} as const;

export default messages;
