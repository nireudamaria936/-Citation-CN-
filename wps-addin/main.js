var citationTaskPane = null;

function GetUrlPath() {
  var href = window.location.href.split("?")[0].split("#")[0];
  return href.slice(0, href.lastIndexOf("/"));
}

function OnAddInLoad() {
  return true;
}

function OpenCitationPane() {
  try {
    if (!citationTaskPane) {
      citationTaskPane = Application.CreateTaskPane(GetUrlPath() + "/taskpane.html", "法引检查");
      if (!citationTaskPane) {
        Application.Alert("无法创建法引任务窗格，请确认当前 WPS 版本支持 JavaScript 加载项。");
        return;
      }
      citationTaskPane.DockPosition = Application.Enum.JSKsoEnum_msoCTPDockPositionRight;
      citationTaskPane.Width = 430;
    }
    citationTaskPane.Visible = true;
  } catch (error) {
    alert("打开法引检查失败：" + error.message);
  }
}

globalThis.OnAddInLoad = OnAddInLoad;
globalThis.OpenCitationPane = OpenCitationPane;
