const sentiment = require('sentiment');
const natural = require('natural');

// Initialize sentiment analyzer
const analyzer = new sentiment();

// Offensive words list (basic implementation)
const OFFENSIVE_WORDS = [
  'damn', 'hell', 'crap', 'stupid', 'idiot', 'moron', 'asshole', 'bastard',
  'fuck', 'shit', 'bitch', 'cunt', 'dick', 'pussy', 'cock', 'ass',
  'nigger', 'faggot', 'retard', 'spastic', 'cripple', 'lame'
];

// Meaningful content keywords (expand as needed)
const MEANINGFUL_KEYWORDS = [
  'vehicle', 'car', 'bike', 'parking', 'registration', 'model', 'color',
  'number', 'plate', 'owner', 'name', 'email', 'phone', 'student', 'employee',
  'campus', 'vnr', 'college', 'university', 'transport', 'commute'
];

class ContentAnalysisService {
  /**
   * Analyze text content for sentiment and appropriateness
   * @param {string} text - Text to analyze
   * @returns {Object} Analysis result
   */
  analyzeContent(text) {
    if (!text || typeof text !== 'string') {
      return { isValid: false, reason: 'Invalid or empty content' };
    }

    const trimmedText = text.trim();
    if (trimmedText.length < 3) {
      return { isValid: false, reason: 'Content too short' };
    }

    // Sentiment analysis
    const sentimentResult = analyzer.analyze(trimmedText);
    const sentimentScore = sentimentResult.score;

    // Check for offensive content
    const lowerText = trimmedText.toLowerCase();
    const hasOffensiveWords = OFFENSIVE_WORDS.some(word =>
      lowerText.includes(word.toLowerCase())
    );

    // Check meaningfulness
    const wordCount = trimmedText.split(/\s+/).length;
    const meaningfulWordCount = MEANINGFUL_KEYWORDS.filter(keyword =>
      lowerText.includes(keyword.toLowerCase())
    ).length;

    const meaningfulnessRatio = meaningfulWordCount / wordCount;

    // Validation logic
    if (hasOffensiveWords) {
      return {
        isValid: false,
        reason: 'Content contains inappropriate language',
        sentiment: sentimentScore,
        analysis: sentimentResult
      };
    }

    if (sentimentScore < -3) {
      return {
        isValid: false,
        reason: 'Content appears to be too negative',
        sentiment: sentimentScore,
        analysis: sentimentResult
      };
    }

    if (wordCount > 5 && meaningfulnessRatio < 0.1) {
      return {
        isValid: false,
        reason: 'Content lacks meaningful context',
        sentiment: sentimentScore,
        analysis: sentimentResult
      };
    }

    return {
      isValid: true,
      sentiment: sentimentScore,
      analysis: sentimentResult,
      wordCount,
      meaningfulnessRatio
    };
  }

  /**
   * Check if text contains spam-like patterns
   * @param {string} text - Text to check
   * @returns {boolean} True if spam-like
   */
  isSpam(text) {
    if (!text) return false;

    const lowerText = text.toLowerCase();

    // Check for excessive repetition
    const words = lowerText.split(/\s+/);
    const uniqueWords = new Set(words);
    if (words.length > 10 && uniqueWords.size / words.length < 0.3) {
      return true;
    }

    // Check for excessive special characters
    const specialCharCount = (text.match(/[^a-zA-Z0-9\s]/g) || []).length;
    if (specialCharCount / text.length > 0.3) {
      return true;
    }

    // Check for all caps
    const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
    if (text.length > 10 && capsRatio > 0.8) {
      return true;
    }

    return false;
  }

  /**
   * Comprehensive content validation
   * @param {string} text - Text to validate
   * @param {Object} options - Validation options
   * @returns {Object} Validation result
   */
  validateContent(text, options = {}) {
    const {
      minLength = 3,
      maxLength = 1000,
      requireMeaningful = true,
      strictSentiment = false
    } = options;

    if (!text || typeof text !== 'string') {
      return { isValid: false, reason: 'Invalid content type' };
    }

    const trimmedText = text.trim();

    if (trimmedText.length < minLength) {
      return { isValid: false, reason: `Content too short (minimum ${minLength} characters)` };
    }

    if (trimmedText.length > maxLength) {
      return { isValid: false, reason: `Content too long (maximum ${maxLength} characters)` };
    }

    if (this.isSpam(trimmedText)) {
      return { isValid: false, reason: 'Content appears to be spam' };
    }

    const analysis = this.analyzeContent(trimmedText);

    if (!analysis.isValid) {
      return analysis;
    }

    if (strictSentiment && analysis.sentiment < -1) {
      return {
        isValid: false,
        reason: 'Content sentiment is too negative',
        sentiment: analysis.sentiment
      };
    }

    return {
      isValid: true,
      analysis,
      metadata: {
        length: trimmedText.length,
        wordCount: trimmedText.split(/\s+/).length
      }
    };
  }
}

module.exports = new ContentAnalysisService();
