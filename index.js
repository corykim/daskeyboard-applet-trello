const q = require('daskeyboard-applet');
const logger = q.logger;

const request = require('request-promise');

const apiUrl = 'https://api.trello.com/1';

const keyLastActionDate = 'lastActionDate';

async function getBoards(apiKey, token) {
  return request.get({
    url: apiUrl + `/members/me/boards?key=${apiKey}&token=${token}`,
    json: true
  }).catch(error => {
    logger.error("Could not get boards: " + error);
    throw error;
  });
}

async function getActionsForBoard(boardId, apiKey, token) {
  return request.get({
    url: apiUrl + `/boards/${boardId}/actions?key=${apiKey}&token=${token}`,
    json: true
  }).catch(error => {
    logger.error(`Could not get actions for board ${boardId}: ` + error);
    throw error;
  });
}

function getTimestamp(date) {
  date = date || new Date();
  return date.toISOString();
}

class Trello extends q.DesktopApp {
  constructor() {
    super();
    this.timestamp = getTimestamp();
  }
  async run() {
    console.log("Running.");
    return this.getNewActions().then(newActions => {
      this.timestamp = getTimestamp();
      if (newActions && newActions.length > 0) {
        logger.info("Got " + newActions.length + " new actions.");
        return new q.Signal({
          points: [[new q.Point("#00FF00")]],
          name: `You have ${newActions.length} new actions in Trello.`
        });
      } else {
        return null;
      }
    })
  }

  async getNewActions() {
    const newActions = [];

    logger.info("Checking for actions since: " + this.timestamp);

    const apiKey = this.authorization.apiKey;
    const token = this.config.token;

    return getBoards(apiKey,
      token).then(async (boards) => {
      if (boards && boards.length > 0) {
        for (let board of boards) {
          const actions = await getActionsForBoard(board.id,
            apiKey, token);
          for (let action of actions) {
            if (action.date > this.timestamp) {
              logger.info(
                `Found new action date ${action.date} (vs: ${this.timestamp})`);
              newActions.push(action);
            }
          }
        }
      }

      return newActions;
    }).catch(error => {
      throw error;
    });
  }

}


module.exports = {
  getBoards: getBoards,
  getActionsForBoard: getActionsForBoard,
  getTimestamp: getTimestamp,
  keyLastActionDate: keyLastActionDate,
  Trello: Trello
}

const applet = new Trello();