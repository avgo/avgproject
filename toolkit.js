function days_in_month(y,m)
{
  if (m == 4 || m == 6 || m == 9 || m == 11)
    return 30;
  else
  if (m == 2)
  {
    if (y % 4)
      return 28;
    else
      return 29;
  }
  else
  if (m < 1 || 12 < m)
    ;
  else
    return 31;
}

function elem_coords(e) {
  var box = e.getBoundingClientRect();

  var body = document.body;
  var de = document.documentElement;

  var scrollTop = window.pageYOffset || de.scrollTop || body.scrollTop;
  var scrollLeft = window.pageXOffset || de.scrollLeft || body.scrollLeft;

  var clientTop = de.clientTop || body.clientTop || 0;
  var clientLeft = de.clientLeft || body.clientLeft || 0;

  var top = box.top + scrollTop - clientTop;
  var left = box.left + scrollLeft - clientLeft;

  return {
    top: top,
    left: left
  };
}

function min_max_check(el,min,max)
{
  el.value = el.value.replace(/[^0-9]/g, '');

  if (el.value == "")
    el.value = min;

  if (el.value > max)
    el.value = max;

  if (el.value < min)
    el.value = min;
}

function toolkit_datetime_picker(get_value, set_value)
{
  var el = {
    create: function()
    {
      this.el_main = document.createElement("span");

      this.el_button = document.createElement("button");

      this.el_main.appendChild(this.el_button);

      this.el_button.addEventListener("click", (function(x)
      {
        return function()
        {
          var c = elem_coords(x.el_main);

          x.popup_win.style.setProperty("display", "block");
          x.popup_win.style.setProperty("left", c.left + "px");
          x.popup_win.style.setProperty("top", (c.top+x.el_main.offsetHeight) + "px");

          var d;

          if (get_value)
            d = new Date(get_value());

          if (!d) d = new Date();

          x.year_pick.value = d.getFullYear();
          x.month_pick.value = d.getMonth() + 1;
          x.day_pick.value = d.getDate();
          x.hours_pick.value = d.getHours();
          x.minutes_pick.value = d.getMinutes();
          x.seconds_pick.value = d.getSeconds();

          x.update_calendar();
        };
      })(this));

      this.el_button.appendChild(document.createTextNode("dtm_picker"));

      var popup_win = document.createElement("div");

      this.popup_win = popup_win;

      popup_win.className = "toolkit_dtm_picker";

      var btn_close = document.createElement("input");

      btn_close.className  = "toolkit_small_button";
      btn_close.type       = "button";
      btn_close.value      = "close";

      btn_close.addEventListener("click", (function(x)
      {
        return function()
        {
          x.popup_win.style.setProperty("display", "none");
        };
      })(this));

      popup_win.appendChild(btn_close);

      var btn_set = document.createElement("input");

      btn_set.className  = "toolkit_small_button";
      btn_set.type       = "button";
      btn_set.value      = "set";

      btn_set.addEventListener("click", (function(x)
      {
        return function()
        {
          x.popup_win.style.setProperty("display", "none");
        };
      })(this));

      popup_win.appendChild(btn_set);

      popup_win.appendChild(document.createElement("br"));

      var year_pick = document.createElement("input");

      year_pick.type = "text";
      year_pick.value = "YYYY";
      year_pick.style.setProperty("width", "45px");
      year_pick.style.setProperty("text-align", "center");
      year_pick.addEventListener("wheel", (function (x)
      {
        return function(ev)
        {
          ev.preventDefault();

          min_max_check(x.year_pick,0,9999);

          if (ev.deltaY < 0 && x.year_pick.value < 9999)
            ++x.year_pick.value;
          else
          if (ev.deltaY > 0 && x.year_pick.value > 0)
            --x.year_pick.value;

          x.day_correction();
          x.update_calendar();
        };
      })(this));
      year_pick.addEventListener("input", (function(x)
      {
        return function ()
        {
          min_max_check(x.year_pick,0,9999);
          x.day_correction();
          x.update_calendar();
        };
      })(this));

      this.year_pick = year_pick;

      popup_win.appendChild(year_pick);

      popup_win.appendChild(document.createTextNode("-"));

      var month_pick = document.createElement("input");

      month_pick.type = "text";
      month_pick.value = "MM";
      month_pick.style.setProperty("width", "30px");
      month_pick.style.setProperty("text-align", "center");
      month_pick.addEventListener("wheel", (function (obj,el,min,max)
      {
        return function(ev)
        {
          ev.preventDefault();

          var y = obj.year_pick.value;
          var m = el.value;

          var t = y*12+(m-1);
          var t_max = (9999-0+1) * (12-1+1);

          if (ev.deltaY < 0 && t < t_max)
            ++t;
          else
          if (ev.deltaY > 0 && t > 0)
            --t;

          y = Math.floor(t / 12);
          m = t % 12 + 1;

          obj.year_pick.value   = y;
          obj.month_pick.value  = m;

          obj.day_correction();
          obj.update_calendar();
        };
      })(this,month_pick,1,12));
      month_pick.addEventListener("input", (function(x)
      {
        return function ()
        {
          min_max_check(x.month_pick,1,12);
          x.day_correction();
          x.update_calendar();
        };
      })(this));

      this.month_pick = month_pick;

      popup_win.appendChild(month_pick);

      popup_win.appendChild(document.createTextNode("-"));

      var day_pick = document.createElement("input");

      day_pick.type = "text";
      day_pick.value = "DD";
      day_pick.style.setProperty("width", "30px");
      day_pick.style.setProperty("text-align", "center");
      day_pick.addEventListener("wheel", (function(x)
      {
        return function(ev)
        {
          ev.preventDefault();

          var dtm = new Date(
              x.year_pick.value,
              x.month_pick.value-1,
              x.day_pick.value
          );

          if (ev.deltaY < 0)
            dtm.setTime(dtm.getTime() + 24*60*60*1000);
          else
          if (ev.deltaY > 0)
            dtm.setTime(dtm.getTime() - 24*60*60*1000);

          x.year_pick.value   = dtm.getFullYear();
          x.month_pick.value  = dtm.getMonth() + 1;
          x.day_pick.value    = dtm.getDate();

          x.update_calendar();
        };
      })(this));
      day_pick.addEventListener("input", (function(x)
      {
        return function ()
        {
          x.day_correction();
          x.update_calendar();
        };
      })(this));

      this.day_pick = day_pick;

      popup_win.appendChild(day_pick);

      popup_win.appendChild(document.createTextNode(" "));

      var hours_pick = document.createElement("input");

      hours_pick.type = "text";
      hours_pick.value = "HH";
      hours_pick.style.setProperty("width", "30px");
      hours_pick.style.setProperty("text-align", "center");
      hours_pick.addEventListener("wheel", (function(x)
      {
        return function(ev)
        {
          ev.preventDefault();

          var dtm = new Date(
              x.year_pick.value,
              x.month_pick.value-1,
              x.day_pick.value,
              x.hours_pick.value
          );

          if (ev.deltaY < 0)
            dtm.setTime(dtm.getTime() + 60*60*1000);
          else
          if (ev.deltaY > 0)
            dtm.setTime(dtm.getTime() - 60*60*1000);

          x.year_pick.value   = dtm.getFullYear();
          x.month_pick.value  = dtm.getMonth() + 1;
          x.day_pick.value    = dtm.getDate();
          x.hours_pick.value  = dtm.getHours();

          x.update_calendar();
        };
      })(this));
      hours_pick.addEventListener("input", (function(x) {
        return function ()
        {
          min_max_check(x.hours_pick, 0, 23);
          x.update_calendar();
        };
      })(this));

      this.hours_pick = hours_pick;

      popup_win.appendChild(hours_pick);

      popup_win.appendChild(document.createTextNode(":"));

      var minutes_pick = document.createElement("input");

      minutes_pick.type = "text";
      minutes_pick.value = "MM";
      minutes_pick.style.setProperty("width", "30px");
      minutes_pick.style.setProperty("text-align", "center");
      minutes_pick.addEventListener("wheel", (function(x)
      {
        return function(ev)
        {
          ev.preventDefault();

          var dtm = new Date(
              x.year_pick.value,
              x.month_pick.value-1,
              x.day_pick.value,
              x.hours_pick.value,
              x.minutes_pick.value
          );

          if (ev.deltaY < 0)
            dtm.setTime(dtm.getTime() + 60*1000);
          else
          if (ev.deltaY > 0)
            dtm.setTime(dtm.getTime() - 60*1000);

          x.year_pick.value     = dtm.getFullYear();
          x.month_pick.value    = dtm.getMonth() + 1;
          x.day_pick.value      = dtm.getDate();
          x.hours_pick.value    = dtm.getHours();
          x.minutes_pick.value  = dtm.getMinutes();

          x.update_calendar();
        };
      })(this));
      minutes_pick.addEventListener("input", (function(x) {
        return function ()
        {
          min_max_check(x.minutes_pick, 0, 59);
          x.update_calendar();
        };
      })(this));

      this.minutes_pick = minutes_pick;

      popup_win.appendChild(minutes_pick);

      popup_win.appendChild(document.createTextNode(":"));

      var seconds_pick = document.createElement("input");

      seconds_pick.type = "text";
      seconds_pick.value = "SS";
      seconds_pick.style.setProperty("width", "30px");
      seconds_pick.style.setProperty("text-align", "center");
      seconds_pick.addEventListener("wheel", (function(x)
      {
        return function(ev)
        {
          ev.preventDefault();

          var dtm = new Date(
              x.year_pick.value,
              x.month_pick.value-1,
              x.day_pick.value,
              x.hours_pick.value,
              x.minutes_pick.value,
              x.seconds_pick.value
          );

          if (ev.deltaY < 0)
            dtm.setTime(dtm.getTime() + 1000);
          else
          if (ev.deltaY > 0)
            dtm.setTime(dtm.getTime() - 1000);

          x.year_pick.value     = dtm.getFullYear();
          x.month_pick.value    = dtm.getMonth() + 1;
          x.day_pick.value      = dtm.getDate();
          x.hours_pick.value    = dtm.getHours();
          x.minutes_pick.value  = dtm.getMinutes();
          x.seconds_pick.value  = dtm.getSeconds();

          x.update_calendar();
        };
      })(this));
      seconds_pick.addEventListener("input", (function(x) {
        return function ()
        {
          min_max_check(x.seconds_pick, 0, 59);
          x.update_calendar();
        };
      })(this));

      this.seconds_pick = seconds_pick;

      popup_win.appendChild(seconds_pick);

      popup_win.appendChild(document.createElement("br"));

      var calendar = document.createElement("span");

      this.calendar = calendar;

      popup_win.appendChild(calendar);

      this.el_main.appendChild(popup_win);
    },
    day_correction: function()
    {
      min_max_check(this.day_pick, 1, days_in_month(
        this.year_pick.value,
        this.month_pick.value
      ));
    },
    update_calendar: function()
    {
      var cal = this.calendar;

      while (cal.firstChild)
        cal.removeChild(cal.firstChild);

      var t = document.createElement("table");

      t.border = 0;

      var pick_y = parseInt(this.year_pick.value, 10);
      var pick_m = parseInt(this.month_pick.value, 10);
      var pick_d = parseInt(this.day_pick.value, 10);

      var w_d_labels = [ "пн", "вт", "ср", "чт", "пт", "сб", "вс" ];

      var tr, td;

      tr = document.createElement("tr");

      for (var i = 0; i < 7; ++i)
      {
        td = document.createElement("td");
        td.appendChild(document.createTextNode(w_d_labels[i]));
        tr.appendChild(td);
      }

      t.appendChild(tr);

      dtm = new Date(pick_y,pick_m-1,1);

      cal.appendChild(document.createElement("br"));

      // (a-1+max+b)%max+1

      // b=-1, max=12, (a+10)%12+1

      var prev_month = (pick_m + 10) % 12 + 1;

      var cur_month = prev_month;
      var cur_year = cur_month == 12 ? pick_y - 1 : pick_y;
      var cur_dim = days_in_month(cur_year, cur_month);

      var cur_day = (cur_dim - (dtm.getDay()+6) % 7 - 7) % cur_dim + 1;

      for (var i = 0; i < 8; ++i)
      {
        tr = document.createElement("tr");

        for (var dow = 0; dow < 7; ++dow)
        {
          td = document.createElement("td");

          var btn = document.createElement("input");

          btn.type   = "button";
          btn.value  = cur_day;

          btn.style.setProperty("width","25px");
          btn.style.setProperty("text-align","right");

          if (pick_m == cur_month)
          {
            if (pick_d == cur_day)
              btn.style.setProperty("background-color","#FF7575");
            else
            if (dow == 5 || dow == 6)
              btn.style.setProperty("background-color","#FFCFCF");
            else
              btn.style.setProperty("background-color","#CFE7FF");
          }
          else
            btn.style.setProperty("background-color","#ffffff");

          btn.style.setProperty("border-width", "1px");
          btn.style.setProperty("padding", "0px 0px 0px 0px");

          btn.addEventListener("click", (function(obj,y,m,d) {
            return function() {
              obj.year_pick.value   = y;
              obj.month_pick.value  = m;
              obj.day_pick.value    = d;

              obj.update_calendar();
            };
          })(this,cur_year,cur_month,cur_day));

          td.appendChild(btn);

          tr.appendChild(td);

          if (cur_day == cur_dim)
          {
            if (cur_month == 12)
            {
              cur_month = 1;
              ++cur_year;
            }
            else
              ++cur_month;

            cur_day = 1;
            cur_dim = days_in_month(cur_year, cur_month);
          }
          else
            ++cur_day;
        }

        t.appendChild(tr);
      }

      cal.appendChild(t);
    },
  };

  el.create();

  return el;
}

function toolkit_label(get_title, set_title, args)
{
  var el = {
    args: args,
    button_click_change: function()
    {
      var text = this.set_title(this.el_text_edit.value, args);

      while (this.el_text.firstChild)
        this.el_text.removeChild(this.el_text.firstChild);

      this.el_text.appendChild(document.createTextNode(text));

      this.el_button.removeEventListener("click", this.button_click_change_handler);
      this.el_button.addEventListener("click", this.button_click_edit_handler);

      while (this.el_button.firstChild)
        this.el_button.removeChild(this.el_button.firstChild);

      this.el_button.appendChild(document.createTextNode("edit"));
    },
    button_click_edit: function()
    {
      while (this.el_text.firstChild)
        this.el_text.removeChild(this.el_text.firstChild);

      var edit = document.createElement("input");

      edit.type = "text";

      edit.value = this.get_title(this.args);

      edit.addEventListener("keyup", (function(x)
      {
        return function (event)
        {
          event.preventDefault();
          if (event.keyCode != 13)
            return;
          x.el_button.click();
        }
      })(this));

      this.el_text.appendChild(edit);

      this.el_text_edit = edit;

      edit.focus();

      edit.selectionStart  = 0;
      edit.selectionEnd    = edit.value.length;

      while (this.el_button.firstChild)
        this.el_button.removeChild(this.el_button.firstChild);

      this.el_button.appendChild(document.createTextNode("ok"));

      this.el_button.removeEventListener("click", this.button_click_edit_handler);
      this.el_button.addEventListener("click", this.button_click_change_handler);
    },
    create: function()
    {
      this.el_main = document.createElement("span");

      this.el_text = document.createElement("span");

      this.el_text.appendChild(
        document.createTextNode(this.get_title(this.args))
      );

      this.el_main.appendChild(this.el_text);

      this.el_button = document.createElement("button");

      this.el_button.className = "toolkit_small_button";

      this.el_button.appendChild(document.createTextNode("edit"));

      this.button_click_change_handler = (function (x)
      {
        return function() { x.button_click_change(); };
      })(this);

      this.button_click_edit_handler = (function (x)
      {
        return function() { x.button_click_edit(); };
      })(this);

      this.el_button.addEventListener("click", this.button_click_edit_handler);

      this.el_main.appendChild(this.el_button);
    },
    get_title: get_title,
    set_title: set_title
  };

  el.create();

  return el;
}

/* vim: set expandtab ts=2 : */
