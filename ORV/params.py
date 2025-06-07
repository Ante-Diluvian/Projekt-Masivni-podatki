#Training
LR = 1e-4                   #Learning rate
BATCH_SIZE = 32             #Batch size
EPOCHS = 50                 #Number of epochs

#Transfer learning
UNFROZEN_BLOCKS = 10        #Number of blocks to fine-tune

#Model and embedding
EMBED_DIM = 128             #Embedding dimension size
THRESHOLD = 0.7             #Threshold for cerification

#Data
IMG_SIZE = (224, 224)       #Input image size
MAX_IMAGES = 100            #Max images per class
MIN_IMAGES = 50             #Min images per class
MAX_PEOPLE = 50             #Number of diferent people