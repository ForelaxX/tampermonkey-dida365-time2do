// ==UserScript==
// @name         dida365-time2do
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  滴答清单的时间统计脚本
// @author       Forelax
// @match        https://dida365.com/*
// @require      https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js
// @grant        none
// ==/UserScript==

const section = `
<section>
    <ul>
        <li class="project" draggable="false"><a class="project-box project-link l-item"><svg
                    class="icon-summary-list">
                    <use xlink:href="#summary-list"></use>
                </svg><span class="l-title" id="today-tasks-time">今天任务时长</span>
                <div class="color-tip" style="background-color: transparent;"></div>
                <div class="action-tip"><span class="count"></span></div>
            </a>
        </li>
        <li id="smart-project-sortable-placeholder" class="ui-sortable-placeholder hide"></li>
    </ul>
</section>
<section>
    <ul>
        <li class="project" draggable="false"><a class="project-box project-link l-item"><svg
                    class="icon-summary-list">
                    <use xlink:href="#summary-list"></use>
                </svg><span class="l-title" id="tommorrow-tasks-time">明天任务时长</span>
                <div class="color-tip" style="background-color: transparent;"></div>
                <div class="action-tip"><span class="count"></span></div>
            </a>
        </li>
        <li id="smart-project-sortable-placeholder" class="ui-sortable-placeholder hide"></li>
    </ul>
</section>
`.replace("\n", '');

$.when($.ready).then(function () {
    $.when($.ready).then(function () {
        $(document).click(function () {
            axios.get('/api/v2/batch/check/0').then(function (response) {
                // handle success
                const [today, tommorrow] = parseResponse(response);
                $('#today-tasks-time').html(`今日：${today.toFixed(2)}h`)
                $('#tommorrow-tasks-time').html(`明日：${tommorrow.toFixed(2)}h`)
            })
        });
        setTimeout(function () {
            const children = $('#project-list-scroller').children();
            const lastChildIndex = children.length - 1;
            $(section).insertAfter(children[lastChildIndex]);
        }, 2000);
    })
})

const millionSecondsOfDay = 86400000;
const millionSecondsOfTwoDay = 172800000;

function parseResponse(response) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    var todayTime = 0;
    var tommorrowTime = 0;
    const data = response.data.syncTaskBean.update;
    for (const record of data) {
        if (!record.startDate) {
            // 被删除的，没有开始日期的
            continue;
        }
        const startDate = new Date(record.startDate);
        if (startDate - today < millionSecondsOfDay) {
            todayTime += parseTime(record.title);
        } else if (startDate - today < millionSecondsOfTwoDay) {
            tommorrowTime += parseTime(record.title);
        }
    }
    console.log(`today is ${todayTime}`);
    console.log(`tomorrow is ${tommorrowTime}`);
    return [todayTime, tommorrowTime];
}

function parseTime(title) {
    if (title.startsWith('【')) {
        var timeString = title.match(/^【(.*)】/)[1];
        if (timeString.endsWith('m')) {
            timeString = timeString.replace('m', '');
            return +timeString / 60;
        }
        return +timeString
    } else {
        return 5 / 60;
    }
}

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}