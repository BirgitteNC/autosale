-- Samler "Bageri" og "Bager" til én kognitiv kategori for at undgå forvirring på tabletten.
UPDATE ingredients 
SET kategori = 'Bager' 
WHERE kategori = 'Bageri';
