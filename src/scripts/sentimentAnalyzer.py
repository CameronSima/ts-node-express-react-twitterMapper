from nltk.sentiment.vader import SentimentIntensityAnalyzer
import sys, json

def read_input():
    lines = sys.stdin.read()
    return json.loads(lines)

def get_sentiments(tweet):
    sid = SentimentIntensityAnalyzer()
    sentiment = sid.polarity_scores(tweet['text'])
    tweet['sentimentData'] = sentiment
    print tweet
   

def main():
    lines = read_input()
    for line in lines:
        get_sentiments(line)

if __name__ == '__main__':
    main()
