-- Create card_templates table
CREATE TABLE IF NOT EXISTS card_templates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  school_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  background_image VARCHAR(255),
  orientation VARCHAR(20) DEFAULT 'portrait', -- portrait, landscape
  layout JSON, -- JSON object containing positions and styles of elements
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  INDEX idx_school_id (school_id),
  INDEX idx_is_default (is_default)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default template
INSERT INTO card_templates (school_id, name, description, orientation, layout, is_default) VALUES
(1, 'Template Default', 'Template kartu siswa standar dengan layout portrait', 'portrait', 
'{"elements": [
  {"type": "photo", "x": 50, "y": 80, "width": 120, "height": 150, "borderRadius": 8},
  {"type": "qrcode", "x": 180, "y": 80, "size": 80},
  {"type": "text", "x": 50, "y": 240, "field": "name", "fontSize": 18, "fontWeight": "bold", "color": "#000000"},
  {"type": "text", "x": 50, "y": 265, "field": "nis", "fontSize": 14, "color": "#666666", "label": "NIS: "},
  {"type": "text", "x": 50, "y": 285, "field": "class", "fontSize": 14, "color": "#666666", "label": "Kelas: "},
  {"type": "text", "x": 50, "y": 305, "field": "card_number", "fontSize": 12, "color": "#999999", "label": "No. Kartu: "},
  {"type": "barcode", "x": 50, "y": 330, "width": 200, "height": 50}
]}', TRUE);
