import urllib.parse

def safe_decode(obj):
    """
    Safely decode bytes objects to UTF-8 strings.
    
    Args:
        obj: The object to decode if it's bytes
        
    Returns:
        Decoded string if obj is bytes, otherwise the original object
    """
    if isinstance(obj, bytes):
        return obj.decode('utf-8', errors='replace')
    return obj

def url_encode(url: str) -> str:
    """
    URL encode a string to make it safe for use in URLs.
    
    Args:
        url: The URL string to encode
        
    Returns:
        URL-encoded string
    """
    return urllib.parse.quote_plus(url) 