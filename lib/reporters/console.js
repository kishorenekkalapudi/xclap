const chalk = require("chalk");
const logger = require("../logger");
const stringify = require("../stringify");
const assert = require("assert");

class XReporterConsole {
  constructor(clap) {
    this._clap = clap;
    clap.on("execute", (data) => this._onExecute(data));
    clap.on("done-item", (data) => this._onDoneItem(data));
    this._tags = {};
    this._logger = logger;
  }

  _log(qItem, msg) {
    this._logger.log(`${this._indent(qItem)}${msg}`);
    this._tags[qItem.id] = { sep: this._sep, msg };
  }

  _indent(qItem, sep) {
    if (sep === undefined) {
      this._sep = this._sep === "." ? "-" : ".";
      sep = this._sep;
    }
    if (qItem.level) {
      return new Array(qItem.level + 1).join(sep);
    } else {
      return "";
    }
  }

  _onExecute(data) {
    const m = `_onExeType_${data.type.replace(/-/g, "_")}`;
    this[m](data);
  }

  _onExeType_shell(data) {
    const qItem = data.qItem;
    const msg = data.anon
      ? `Executing ${chalk.cyan(data.cmd)}`
      : `Executing task ${chalk.cyan(qItem.name)} ${chalk.blue(data.cmd)}`;
    this._log(qItem, msg);
  }

  _onExeType_lookup(data) {
    // do nothing
  }

  _onExeType_dep(data) {
    const qItem = data.qItem;
    const msg = `Processing task ${chalk.cyan(qItem.name)} dependencies`;
    this._log(qItem, msg);
  }

  _onExeType_serial_arr(data) {
    const qItem = data.qItem;
    const ts = chalk.blue(stringify(data.array));
    const msg = `Processing task ${chalk.cyan(qItem.name)} serial array ${ts}`;
    this._log(qItem, msg);
  }

  _onExeType_concurrent_arr(data) {
    const qItem = data.qItem;
    const ts = chalk.blue(stringify(data.array));
    const msg = `Processing task ${chalk.cyan(qItem.name)} concurrent array ${ts}`;
    this._log(qItem, msg);
  }

  _onExeType_function(data) {
    const qItem = data.qItem;
    const name = `task ${chalk.cyan(qItem.name)}`;
    const anon = qItem.anon ? " anonymous " : " as ";
    const msg = `Executing ${name}${anon}function`;
    this._log(qItem, msg);
  }

  _onDoneItem(data) {
    const qItem = data.qItem;
    const xqItem = data.xqItem;
    const msec = `(${data.elapse.toFixed(2)} ms)`;
    const failed = !!this._clap.failed || !!xqItem.err;
    const result = xqItem.err ? "Failed" : "Done";
    const status = failed ? chalk.red(result) : chalk.green(result);
    const tag = this._tags[xqItem.id];
    assert(tag, "console reporter no tag found for ${xqItem.name}");

    this._logger.log(`${this._indent(xqItem, ">")}${status} ${tag.msg} ${chalk.magenta(msec)}`);
  }
}

module.exports = XReporterConsole;