
import { BrowserWindow } from 'electron';
const camMenu = [
  {
    label: '关闭窗口',
    click: () => {
      const win = BrowserWindow.getFocusedWindow();
      if (win) {
        win.close();
      }
    },
  },
  {
    label: '测试菜单',
    click: () => {
      const win = BrowserWindow.getFocusedWindow();
      if (win) {
        win.close();
      }
    },
  },
];

const getMenu = (win) => {
  switch (win) {
    case 'cam':
      return camMenu
    default:
      return null
      break;
  }
}

const rightMenu = {
  camMenu,
  getMenu
}

export default rightMenu