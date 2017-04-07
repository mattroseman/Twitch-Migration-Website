from flask import Flask
from flask import render_template
from flask import jsonify
from lib.db_connect import NoSQLConnection

app = Flask(__name__)

print('connecting to database')
con = NoSQLConnection()


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/streams/<streamname>/viewercount")
def get_viewercount(streamname):
    """
    gets the latest viewcount for the specified streamer
    """
    pipeline = [
        {'$match': {'streamname': streamname}},
        {'$sort': {'time': -1}},
        {
            '$group': {
                '_id': '$streamname',
                'latest_user_count': {'$first': '$user_count'}
            }
        }
    ]
    result = con.db[con.viewercount_collection].aggregate(pipeline)
    try:
        return result.next()
    except StopIteration:
        return None


@app.route("/streams/viewercounts")
def get_latest_viewcounts():
    """
    gets the latest viewcounts for all streams
    @return: JSON the key being the streamname and value being viewcount
    """
    # this query sorts by latest entry and then groups by streamname
    # thereby getting the latest usercount for each monitored streamer
    pipeline = [
        {'$sort': {'time': -1}},
        {
            '$group': {
                '_id': '$streamname',
                'latest_user_count': {'$first': '$user_count'}
            }
        }
    ]
    result = con.db[con.viewercount_collection].aggregate(pipeline)
    latest_viewcounts = {}
    for doc in result:
        latest_viewcounts[doc['_id']] = doc['latest_user_count']

    return jsonify(latest_viewcounts)


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
