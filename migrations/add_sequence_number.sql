-- Add sequence_number column with a temporary NULL constraint
ALTER TABLE chat_messages ADD COLUMN sequence_number INT NULL;

-- Update existing records with sequence numbers based on created_at
SET @seq := 0;
UPDATE chat_messages 
SET sequence_number = (@seq := @seq + 1) 
WHERE session_id IN (SELECT id FROM chat_sessions) 
ORDER BY created_at ASC;

-- Make sequence_number NOT NULL after populating data
ALTER TABLE chat_messages MODIFY COLUMN sequence_number INT NOT NULL;

-- Add unique constraint for session_id and sequence_number
ALTER TABLE chat_messages ADD UNIQUE KEY unique_session_sequence (session_id, sequence_number);

-- Modify created_at to use microsecond precision
ALTER TABLE chat_messages MODIFY COLUMN created_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP(6);

-- Verify the changes
SELECT COUNT(*) as total_messages,
       COUNT(DISTINCT sequence_number) as unique_sequences,
       MIN(sequence_number) as min_seq,
       MAX(sequence_number) as max_seq
FROM chat_messages; 