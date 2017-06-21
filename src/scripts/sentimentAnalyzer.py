from nltk.sentiment.vader import SentimentIntensityAnalyzer
import sys, json

def read_input():
    lines = sys.stdin.read()
    return json.loads(lines)

def get_sentiments(sentence):
    sid = SentimentIntensityAnalyzer()
    ss = sid.polarity_scores(sentence)

    for k in sorted(ss):
        print('{0}: {1}, '.format(k, ss[k]))

def main():
    lines = read_input()
    for line in lines:
        sentence = line['text']
        get_sentiments(sentence)

if __name__ == '__main__':
    main()
