const assert = require('assert');
const t = require('../index');
const auth = require('./auth.json');

const apiKey = auth.apiKey;
const token = auth.token;

describe('getBoards', function () {
  it('can get boards', function () {
    return t.getBoards(apiKey, token).then((boards) => {
      console.log("Boards: ", boards);
      assert.ok(boards);
      assert.ok(boards[0]);
      assert.ok(boards[0].id);
    }).catch((error) => {
      assert.fail(error);
    })
  })
});

describe('getActionsForBoard', function () {
  it('can get actions for board', function () {
    return t.getActionsForBoard('5be9f7545b05e45e0092f4dd',
      apiKey, token).then(actions => {
      console.log('Actions: ', actions);
      assert.ok(actions);
      assert.ok(actions[0]);
      assert.ok(actions[0].id);
    }).catch(error => {
      assert.fail(error);
    })
  })
});

describe('Trello', () => {
  async function makeApp() {
    let app = new t.Trello();

    await app.processConfig({
      extensionId: 777,
      geometry: {
        width: 1,
        height: 1,
      },
      authorization: auth,
      applet: {
        user: {
          token: token,
        }
      }
    });

    return app;
  }

  describe('#getNewActions', () => {
    it('can get new actions with null lastActionDate', function () {
      return makeApp().then(app => {
        app.store.put(t.keyLastActionDate, null);
        return app.getNewActions().then(actions => {
          assert.ok(actions);
          assert.ok(actions[0]);
          assert.ok(actions[0].id);
        }).catch(error => {
          assert.fail(error);
        })
      })
    });

    it("gets new actions with old lastActionDate", function () {
      return makeApp().then(app => {
        app.store.put(t.keyLastActionDate, 
          new Date('2018-01-17T03:24:00').toISOString());
        return app.getNewActions().then(actions => {
          assert.ok(actions);
          assert.ok(actions[0]);
          assert.ok(actions[0].id);
        }).catch(error => {
          assert.fail(error);
        })
      })
    });

    it("doesn't return new actions with current lastActionDate", function () {
      return makeApp().then(app => {
        app.store.put(t.keyLastActionDate, new Date().toISOString);
        return app.getNewActions().then(actions => {
          assert.ok(actions);
          assert(actions.length === 0);
        }).catch(error => {
          assert.fail(error);
        })
      })
    });
  });

  describe('#run()', () => {
    return makeApp().then(app => {
      return app.run().then((signal) => {
        console.log(signal);
        assert.ok(signal);
      }).catch((error) => {
        assert.fail(error)
      });
    })
  })
})