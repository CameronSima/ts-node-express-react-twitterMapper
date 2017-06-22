import sys, json
from nltk.sentiment.vader import SentimentIntensityAnalyzer

def read_input():
    lines = sys.stdin.read()
    return json.loads(lines)


def get_sentiments(tweet):
    sia = SentimentIntensityAnalyzer()
    try:
        sentiment = sia.polarity_scores(tweet['text'])
        tweet['sentimentData'] = sentiment
        print json.dumps(tweet)
    except:
        pass

def main():
    lines = read_input()
    for line in lines:
        get_sentiments(line)
    sys.stdin.flush()

if __name__ == '__main__':
    main()
