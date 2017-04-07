from flask import Flask
from flask import request
from flask import render_template
from lib.db_connect import NoSQLConnection

app = Flask(__name__)

print('connecting to database')
con = NoSQLConnection()


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/streams/<streamname>/viewercount")
def get_viewercount():
    """
    gets the latest viewcount for the
    """
    start_time = request.args.get('start', 0, type=int)
    end_time = request.args.get('end', 0, type=int)
    print("{0} - {0}".format(start_time, end_time))
    return start_time
    # return a json of streamname and viewercount


def get_latest_viewcount(streamname):
    """
    gets the latest viewcount for the stream specified
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


def get_latest_viewcounts():
    """
    gets the latest viewcounts for all streams
    @return: an array of tuples with the first element being the streamname
        and second being the the latest user_count
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
    latest_viewcounts = []
    for doc in result:
        latest_viewcounts.append((doc['_id'], doc['latest_user_count']))

    return latest_viewcounts


get_latest_viewcount('summit1g')


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
