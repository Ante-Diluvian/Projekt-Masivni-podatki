import tensorflow as tf

from tensorflow.keras import Model
from tensorflow.keras.layers import Input, Dense, GlobalAveragePooling2D
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.losses import SparseCategoricalCrossentropy
from tensorflow.keras.applications import MobileNetV2

from params import EMBED_DIM, LR, UNFROZEN_BLOCKS

def build_model(num_classes=None, transfer_learning=True, input_shape=(160,160,3)):
    inp = Input(shape=input_shape)  #Define the input layer
    backbone = MobileNetV2(input_tensor=inp, include_top=False, pooling='avg', weights='imagenet')  #Load pre-trained MobileNetV2 without top layer
    x = backbone.output                                             #Get output from backbone
    emb = Dense(EMBED_DIM, activation=None, name='embedding')(x)    #Add embedding layer without activation

    if transfer_learning:
        #Freeze all layers
        for layer in backbone.layers:
            layer.trainable = False  #Freeze all layers in backbone

        #Unfreeze the last few convolutional blocks
        blocks = [l for l in backbone.layers if 'conv' in l.name or 'block' in l.name]  #Select conv or block layers
        for block in blocks[-UNFROZEN_BLOCKS:]:
            block.trainable = True                                          #Unfreeze last N blocks for fine-tuning

    if num_classes:
        logits = Dense(num_classes, use_bias=False, name='logits')(emb)     #Add final dense layer for classification
        model = Model(inputs=inp, outputs=[emb, logits])                    #Output both embedding and classification logits

        model.compile(
            optimizer=Adam(learning_rate=LR),                               #Set optimizer
            loss=[None, SparseCategoricalCrossentropy(from_logits=True)],   #Use crossentropy for classification only
            metrics=[None, 'accuracy']                                      #Track accuracy for classification
        )
    else:
        model = Model(inputs=inp, outputs=emb)  #If no classification, output only embeddings

    return model  # Return the final model
